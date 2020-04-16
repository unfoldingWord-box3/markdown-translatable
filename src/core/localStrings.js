// 
// Translate strings into different languages 
// Then use localString(id) to return the language specific string to use
//
// To use:
// 1. Import:
//    import { Tooltip } from '@material-ui/core';
//    import { localString } from '../../core/localStrings';
//
// 2. Update string ids as needed
// 3. Wrap button (if a tooltip):
//    <Tooltip title={localString(iconTooltip)} arrow>
//        <Translate />
//    </Tooltip>
// 4. -or- just call exported function, where a string is needed:
//
//    localString(stringid)
//
const strings = {
    en:{
        Preview: "Preview",
        Save: "Save",
        BlockView: "Block View",
        SectionView: "Section View",
        Expand: "Expand",
        Collapse: "Collapse",
        /* do not remove these two */
        StringMissing:"String Id missing",
        LangNotSupported: "Language not supported"
    },
    el: {
        StringMissing:"λείπει το εργαλείο"
    }
};

export const localString = (id) => {
    let lang = navigator.language.split(/-|_/)[0];
    // if language is unknown (not sure this can actually happen)
    if ( lang === undefined ) {
        lang = 'en';
    }
    // if there are no strings for the language
    if ( strings[lang] === undefined ) {
        lang = 'en';
        return strings[lang]['LangNotSupported'];
    }
    let lstring = strings[lang][id];
    // if a string for the message id is missing
    if ( lstring === undefined ) {
        return strings[lang]['StringMissing']
    }
    return lstring;
};
