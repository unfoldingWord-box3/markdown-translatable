import React, {
  useMemo, useCallback, useContext,
} from 'react';
import PropTypes from 'prop-types';

import * as helpers from '../../core/';
import {
  markdownToHtml,
  htmlToMarkdown,
  filter,
  fromDisplay,
  toDisplay,
} from '../../core/';
import { MarkdownContext } from '../Markdown.context';
import { useStyles } from './useStyles';


function BlockEditable({
  markdown,
  onEdit,
  inputFilters,
  outputFilters,
  style,
  preview,
  editable,
  fontSize,
}) {
  const classes = useStyles();
  const { actions } = useContext(MarkdownContext);
  const _oldMarkdown = { markdown };

  const _style = useMemo(
    () =>
      helpers.isHebrew(markdown) ? { ...style, fontSize: '1.5em' } : style,
    [style, markdown]
  );

  const handleBlur = useCallback(
    (_markdown) => {
      const oldHTML = markdownToHtml({
        markdown: _oldMarkdown.markdown,
        inputFilters: inputFilters,
      });
      const newHTML = markdownToHtml({
        markdown: _markdown,
        inputFilters: inputFilters,
      });

      // TODO: do we need to calculate HTML each time??
      if (oldHTML !== newHTML || _oldMarkdown.markdown !== _markdown) {
        _oldMarkdown.markdown = _markdown;
        onEdit(_markdown);
      }
    },
    [_oldMarkdown.markdown, inputFilters, onEdit]
  );

  const handleHTMLBlur = useCallback(
    (e) => {
      const html = e.target.innerHTML;
      const _markdown = htmlToMarkdown({ html, outputFilters });
      handleBlur(_markdown);
    },
    [handleBlur, outputFilters]
  );

  const handleRawBlur = useCallback(
    (e) => {
      let string = e.target.innerText;
      string = fromDisplay(string);
      const _markdown = filter({ string, filters: outputFilters });
      handleBlur(_markdown);
    },
    [handleBlur, outputFilters]
  );

  const handleKeyPress = useCallback(
    (keycode) => {
      if (actions && actions.setIsChanged) {
        actions.setIsChanged(true);
      }
    }, [actions]
  );

  const handledKeyCodes = [8/*Delete/Backspace*/];

  const handleKeyUp = useCallback(
    (event) => {
      if (actions && actions.setIsChanged) {
        if (handledKeyCodes.includes(event.keyCode)) {
          // NOTE: we don't want to convert HTML on key keyUp.
          // So we cant test for changes.
          actions.setIsChanged(true);
        }
      }
    }, [actions]
  );

  const handleCutPaste = useCallback(
    () => {
      if (actions && actions.setIsChanged) {
        actions.setIsChanged(true);
      }
      if (actions && actions.setIsAutoSaveChanged) {
        actions.setIsAutoSaveChanged(true);
      }
    }, [actions]
  );

  const component = useMemo(() => {
    let _component;

    if (!preview) {
      let code = filter({ string: markdown, filters: inputFilters });
      code = toDisplay(code);
      const dangerouslySetInnerHTML = { __html: code };

      _component = (
        <pre className={classes.pre}>
          <code
            className={classes.markdown}
            style={{ ..._style, fontSize }}
            dir='auto'
            contentEditable={editable}
            dangerouslySetInnerHTML={dangerouslySetInnerHTML}
            onBlur={handleRawBlur}
            onKeyPress={handleKeyPress}
            onKeyUp={handleKeyUp}
            onCut={handleCutPaste}
            onPaste={handleCutPaste}
          />
        </pre>
      );
    } else {
      const dangerouslySetInnerHTML = { __html: markdownToHtml({ markdown, inputFilters }) };

      _component = (
        <div
          style={{ ..._style, fontSize }}
          className={classes.html}
          dir='auto'
          contentEditable={editable}
          dangerouslySetInnerHTML={dangerouslySetInnerHTML}
          onBlur={handleHTMLBlur}
          onKeyPress={handleKeyPress}
          onKeyUp={handleKeyUp}
          onCut={handleCutPaste}
          onPaste={handleCutPaste}
        />
      );
    }
    return _component;
  }, [fontSize, preview, markdown, editable]);

  return <div className={classes.root}>{component}</div>;
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
  /** fontSize e.g. '100%' */
  fontSize: PropTypes.string,
};

BlockEditable.defaultProps = {
  markdown: '',
  onEdit: () => { },
  inputFilters: [],
  outputFilters: [],
  style: {},
  preview: true,
  editable: true,
};

export default BlockEditable;
