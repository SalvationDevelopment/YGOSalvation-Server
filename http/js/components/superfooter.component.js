/*global React, ReactDOM*/
class SuperFooterComponent extends React.Component {
    constructor(store, initialState) {
        super();
        this.store = store;
        this.state = initialState || {};
    }

    update(updatedState) {
        Object.assign(this.state, updatedState);
        return this.state;
    }

    render() {
        return React.createElement('footer', { key: 'footer', className: 'superfooter', id: 'superfooter' },
            React.createElement('div', {}, `YGOPro Salvation Server is not affiliated with Konami, NAS, Shueisha, or Kazuki Takahashi. Salvation Server
                & copy; 2013 - 2017. Powered by Yu - Jo Friendship and fans of Yu - Gi - Oh! worldwide.Please support the offical
        release.`));
    }
}