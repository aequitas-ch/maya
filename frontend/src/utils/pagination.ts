export const extractData = (data: any) => {
    if (data && typeof data === 'object' && 'results' in data && 'count' in data) {
        return data.results;
    }
    return data;
};
