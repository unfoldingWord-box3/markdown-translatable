import React, {
  useRef, useState , useEffect, memo, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';
import debounce from 'lodash.debounce';
import ContentEditable from 'react-contenteditable';

import { withStyles } from '@material-ui/core';
import {
  markdownToHtml,
  htmlToMarkdown,
  isHebrew,
} from '../../core/';
import styles from './useStyles';

function BlockEditable(props) {
  const {
    markdown: __markdown,
    style,
    preview,
    editable,
    inputFilters,
    outputFilters,
    onEdit,
    classes,
    debounce: debounceTime,
  } = props;

  const markdownRef = useRef(null);
  const htmlRef = useRef(null);
  const [markdown, setMarkdown] = useState(__markdown);
  const [html, setHTML] = useState(null);
  const _onEdit = useCallback(onEdit, []);
  const [lastValues, setLastValues] = useState([]);
  const onEditThrottled = useCallback(debounce(_onEdit, debounceTime, { leading: false, trailing: true }), [_onEdit]);

  useEffect(() => {
    const _html = markdownToHtml({
      markdown,
      filters: inputFilters,
    });
    setHTML(_html);
  }, [inputFilters, markdown]);

  const handleMarkdownChange = useCallback((value) => {
    onEditThrottled(value);
    setMarkdown(value);
  }, [onEditThrottled]);

  const handleHTMLChange = useCallback((_html) => {
    setHTML(_html);
    const _markdown = htmlToMarkdown({ html: _html, filters: outputFilters });
    onEditThrottled(_markdown);
  }, [onEditThrottled, outputFilters]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const doc = new DOMParser().parseFromString(pastedData, 'text/html');
    const text = doc.body.textContent || '';
    document.execCommand('insertHTML', false, text);
  }, []);

  const handleUndo = useCallback((e) => {
    if (e.metaKey && e.key === 'z' && lastValues.length) {
      e.target.innerHTML = lastValues.pop();
    }

    if (!e.metaKey || (e.metaKey && e.key === 'v')) {
      const copy = lastValues.slice(0);
      copy.push(e.target.innerHTML);
      setLastValues(copy);
    }
  }, [lastValues]);

  useEffect(() => {
    const el = markdownRef.current;

    if (el) {
      el.addEventListener('paste', handlePaste);
      el.addEventListener('keydown', handleUndo);
    };
    return () => {
      if (el) {
        el.removeEventListener('paste', handlePaste);
        el.removeEventListener('keydown', handleUndo);
      }
    };
  }, [handlePaste, handleUndo, preview]);


  const _style = isHebrew(markdown) ? { ...style, fontSize: '1.5em' } : style;
  return (
    <div className={classes.root}>
      {!preview &&
      <pre className={classes.pre}>
        <ContentEditable disabled={!editable} onChange={(e) => handleMarkdownChange(e.target.value)} html={markdown} dir="auto" className={classes.markdown} style={_style} innerRef={markdownRef} />
      </pre>
      }
      {preview &&
      <ContentEditable
        dir="auto"
        innerRef={htmlRef}
        className={classes.html}
        disabled={!editable}
        style={_style}
        html={html}
        onChange={(e) => handleHTMLChange(e.target.value)}
      />}
    </div>
  );
}

BlockEditable.propTypes = {
  /** Initial markdown for the editor. */
  markdown: PropTypes.string.isRequired,
  /** Function to propogate changes to the markdown. */
  onEdit: PropTypes.func,
  /** Replace strings before rendering. */
  inputFilters: PropTypes.array,
  /** Replace strings after editing. */
  outputFilters: PropTypes.array,
  /** CSS for the component. */
  style: PropTypes.object,
  /** Display Raw Markdown or HTML. */
  preview: PropTypes.bool,
  /** Enable/Disable editability. */
  editable: PropTypes.bool,
  /** CSS clasess from material-ui */
  classes: PropTypes.object.isRequired,
  /** Amount of time to debounce edits */
  debounce: PropTypes.number,
};

BlockEditable.defaultProps = {
  markdown: '',
  onEdit: () => {},
  inputFilters: [
    [/>/gi, '&gt;'],
    [/</gi, '&lt;'],
  ],
  outputFilters: [],
  style: {},
  preview: true,
  editable: true,
  debounce: 200,
};

const propsAreEqual = (prevProps, nextProps) => prevProps.preview === nextProps.preview &&
prevProps.editable === nextProps.editable &&
  isEqual(prevProps.style, nextProps.style) &&
 isEqual(prevProps.outputFilters, nextProps.outputFilters) &&
 isEqual(prevProps.inputFilters, nextProps.inputFilters) &&
prevProps.markdown === nextProps.markdown;

export default withStyles(styles)(memo(BlockEditable, propsAreEqual));
