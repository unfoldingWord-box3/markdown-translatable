import React, {
  useEffect, useMemo, useCallback, useState,
} from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import md5 from 'md5';
import {
  ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, ExpansionPanelActions, IconButton,
} from '@material-ui/core';
import { ExpandMore, ExpandLess } from '@material-ui/icons';

import BlockTranslatable from '../block-translatable';

import { blocksFromMarkdown, markdownFromBlocks } from '../../core/';
import { useStyles } from './styles';

function SectionTranslatable({
  original,
  translation,
  preview,
  inputFilters,
  outputFilters,
  onTranslation,
  onExpanded = () => {},
  expanded = true,
  blockable,
  style,
}) {
  const [translationBlocks, setTranslationBlocks] = useState([]);
  const [originalBlocks, setOriginalBlocks] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    const _originalBlocks = (blockable) ? blocksFromMarkdown({ markdown: original }) : [original];
    setOriginalBlocks(_originalBlocks);
  }, [blockable, original]);

  useEffect(() => {
    const _translationBlocks = (blockable) ? blocksFromMarkdown({ markdown: translation }) : [translation];
    setTranslationBlocks(_translationBlocks);
  }, [blockable, translation]);

  const _onExpanded = useCallback(onExpanded, []);

  // update onTranslation when translationBlocks are updated
  useEffect(() => {
    const _translation = markdownFromBlocks({ blocks: translationBlocks });

    if (_translation !== translation) {
      onTranslation(_translation);
    }
  }, [onTranslation, translation, translationBlocks]);


  const expandedToggle = useCallback(() => {
    _onExpanded(!expanded);
  }, [_onExpanded, expanded]);

  const mostBlocks = originalBlocks.length > translationBlocks.length ?
    originalBlocks : translationBlocks;

  const blocksTranslatables = [];

  for ( let i=0; i < mostBlocks.length; i++ ) {
    const _onTranslation = (item) => {
      const temp = [...setTranslationBlocks];
      temp[i] = item;
      setTranslationBlocks(temp);
    };

    const translationBlock = translationBlocks[i];
    const originalBlock = originalBlocks[i];
    const key = md5(JSON.stringify(originalBlock + i.toString()));

    blocksTranslatables.push(
      <BlockTranslatable
        key={key}
        original={originalBlock}
        translation={translationBlock}
        inputFilters={inputFilters}
        outputFilters={outputFilters}
        onTranslation={_onTranslation}
        preview={preview}
      />
    );
  };

  const titleBlock = originalBlocks[0]?.split('\n\n')[0] || translationBlocks[0]?.split('\n\n')[0];

  const summaryTitle = useMemo(() => (
    (expanded) ? <></> : <ReactMarkdown source={titleBlock} escapeHtml={false} />
  ), [expanded, titleBlock]);
  return (
    <ExpansionPanel style={style} className={classes.root} expanded={expanded}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMore />}
        className={classes.content}
        onClick={expandedToggle}>
        {summaryTitle}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.details}>
        {blocksTranslatables}
      </ExpansionPanelDetails>
      <ExpansionPanelActions className={classes.actions}>
        <IconButton onClick={expandedToggle}>
          <ExpandLess />
        </IconButton>
      </ExpansionPanelActions>
    </ExpansionPanel>
  );
};

SectionTranslatable.propTypes = {
  /** Original markdown for the editor. */
  original: PropTypes.string.isRequired,
  /** Translation markdown for the editor. */
  translation: PropTypes.string.isRequired,
  /** Function to propogate changes to the translation. */
  onTranslation: PropTypes.func.isRequired,
  /** Preview HTML rendered vs Raw Markdown */
  preview: PropTypes.bool,
  /** Function to propogate changes to the Section in focus. */
  onExpanded: PropTypes.func,
  /** Set the Section in focus. */
  expanded: PropTypes.bool,
  /** Divide segments by blocks */
  blockable: PropTypes.bool,
  /** Replace strings before rendering. */
  inputFilters: PropTypes.array,
  /** Replace strings after editing. */
  outputFilters: PropTypes.array,
  /** CSS for the component. */
  style: PropTypes.object,
};

SectionTranslatable.defaultProps = {
  original: '',
  translation: '',
  inputFilters: [],
  outputFilters: [],
  blockable: true,
  style: {},
};

export default SectionTranslatable;


/* code graveyard
  const blockTranslatables = useMemo(() => (
    originalBlocks.map((originalBlock, index) => {
      const _onTranslation = (item) => setTranslationBlock({ index, item });
      const translationBlock = translationBlocks[index];
      const key = index + md5(JSON.stringify(originalBlock + translationBlock));
      return (
        <BlockTranslatable
          key={key}
          original={originalBlock}
          translation={translationBlock}
          inputFilters={inputFilters}
          outputFilters={outputFilters}
          onTranslation={_onTranslation}
          preview={preview}
        />
      );
    })
  ), [originalBlocks, translationBlocks, inputFilters, outputFilters, preview, setTranslationBlock]);
*/