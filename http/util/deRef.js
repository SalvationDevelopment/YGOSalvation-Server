export function deRef(values) {
    return Object.keys(values).reduce((product, ref) => {
        product[ref] = values[ref].current;
        return product;
    }, {});
}