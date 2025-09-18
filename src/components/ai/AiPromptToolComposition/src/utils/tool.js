export const promptFilter = (source) => {
    return source.replace(/，/g, ',').replace(/？/g, ',').replace(/、/g, ',').replace(/。/g, ',').replace(/\r?\n|\r/g, ',').split(',').map(d => d.trim()).filter(d => d);
    // return source.replace(/\r?\n|\r/g, ',').split(',').map(d => d.trim()).filter(d => d);
};

export const promptFilterBreak = (source) => {
    // return source.replace(/，/g, ',').replace(/？/g, ',').replace(/、/g, ',').replace(/。/g, ',').replace(/\r?\n|\r/g, ',').split(',').map(d => d.trim()).filter(d => d);
    return source.replace(/\r?\n|\r/g, ',').split(',').map(d => d.trim()).filter(d => d);
};