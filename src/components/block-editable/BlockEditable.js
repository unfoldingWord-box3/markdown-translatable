import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import * as helpers from './helpers';

// const whyDidYouRender = (process.env.NODE_ENV !== 'production') ?
//   require('@welldone-software/why-did-you-render') : undefined;
// if (whyDidYouRender) whyDidYouRender(React);
/**
 * ### A reusable component for translating a Markdown block as HTML.
 * @component
 */
function BlockEditable({
  classes,
  markdown,
  onEdit,
  inputFilters,
  outputFilters,
  style,
  preview,
  editable,
}) {
  let component;

  const handleBlur = (_markdown) => {
    const oldHTML = helpers.markdownToHtml({markdown, inputFilters});
    const newHTML = helpers.markdownToHtml({markdown: _markdown, inputFilters});
    if (oldHTML !== newHTML) onEdit(_markdown);
  }

  const handleHTMLBlur = (e) => {
    const html = e.target.innerHTML;
    const _markdown = helpers.htmlToMarkdown({html, outputFilters});
    handleBlur(_markdown);
  };

  const handleRawBlur = (e) => {
    const string = e.target.innerText//.replace(/&lt;/g, '<').replace(/&amp;/g, '&');
    const _markdown = helpers.filter({
      string,
      filters: outputFilters
    })
    handleBlur(_markdown);
  };

  if (!preview) {
    const code = markdown//.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const dangerouslySetInnerHTML = { __html: code };
    component = (
      <pre
        className={classes.markdown}
        style={style}
      >
        <code
          className={classes.pre}
          dir="auto"
          contentEditable={editable}
          onBlur={handleRawBlur}
          dangerouslySetInnerHTML={dangerouslySetInnerHTML}
        />
      </pre>
    );
  } else {
    const dangerouslySetInnerHTML = { __html: helpers.markdownToHtml({markdown, inputFilters}) };
    component = (
      <div
        className={classes.html}
        dir="auto"
        contentEditable={editable}
        dangerouslySetInnerHTML={dangerouslySetInnerHTML}
        onBlur={handleHTMLBlur}
      />
    );
  }

  let _style = {...style};
  if (helpers.isHebrew(markdown)) {
    _style.fontSize = '1.5em';
  }

  return (
    <div
      className={classes.root}
      style={_style}
    >
      <div
        className={classes.wrapper}
      >
        {component}
      </div>
    </div>
  );
};

BlockEditable.propTypes = {
  /** @ignore */
  classes: PropTypes.object.isRequired,
  /** Initial markdown for the editor. */
  markdown: PropTypes.string.isRequired,
  /** Function to propogate changes to the markdown. */
  onEdit: PropTypes.func.isRequired,
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
};

BlockEditable.defaultProps = {
  markdown: '',
  onEdit: () => {},
  inputFilters: [],
  outputFilters: [],
  style: {},
  preview: true,
  editable: true,
};

const styles = theme => ({
  root: {
    height: '100%',
    width: '100%',
  },
  wrapper: {
    height: '100%',
    padding: '0 0.5em',
  },
  html: {
    height: '100%',
    width: '100%',
    display: 'grid',
  },
  markdown: {
    height: '100%',
    width: '100%',
    fontSize: '1.1em',
    display: 'grid',
  },
  pre: {
    whiteSpace: 'pre-wrap',
  },
});

const areEqual = (prevProps, nextProps) => {
  const keys = ['markdown', 'preview', 'editable', 'style'];
  const checks = keys.map(key => (JSON.stringify(prevProps[key]) === JSON.stringify(nextProps[key])));
  const equal = !checks.includes(false);
  // console.log('BlockEditable', keys, checks, equal);
  return equal;
};

// BlockEditable.whyDidYouRender = true;
const StyleComponent = withStyles(styles)(BlockEditable);
const MemoComponent = React.memo(StyleComponent, areEqual);
export default MemoComponent;
