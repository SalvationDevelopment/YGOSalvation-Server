const limitors = {
    isCanBeForbidden: ['EFFECT_CHANGE_CODE', 'EFFECT_COUNTER_PERMIT', 'EFFECT_COUNTER_LIMIT']
};


function Effect() {
    const flag = [];

    let code,
        type;

    function is_flag(query) {
        return flag.includes(query);
    }

    function is_disable_related() {
        return (
            code === 'EFFECT_IMMUNE_EFFECT' ||
            code === 'EFFECT_DISABLE' ||
            code === 'EFFECT_CANNOT_DISABLE' ||
            code === 'EFFECT_FORBIDDEN'
        );
    }

    function is_can_be_forbidden() {
        if (is_flag('EFFECT_FLAG_CANNOT_DISABLE') && !is_flag('EFFECT_FLAG_CANNOT_NEGATE')) {
            return false;
        }
        return limitors.isCanBeForbidden.includes(code);
    }

    return {
        is_can_be_forbidden,
        is_disable_related
    };

}

module.exports = Effect;