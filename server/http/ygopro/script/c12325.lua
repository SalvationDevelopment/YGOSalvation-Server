--Toon Shadow
function c12325.initial_effect(c)
	--remove
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DAMAGE)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c12325.condition)
	e1:SetTarget(c12325.target)
	e1:SetOperation(c12325.operation)
	c:RegisterEffect(e1)
end
function c12325.filter(c)
	return c:IsFaceup()
end
function c12325.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(1-tp) and chkc:IsLocation(LOCATION_MZONE) and c12325.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c12325.filter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	Duel.SelectTarget(tp,c12325.filter,tp,0,LOCATION_MZONE,1,1,nil)
end
function c12325.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsFaceup() and tc:IsRelateToEffect(e) then
		Duel.Damage(1-tp,tc:GetAttack(),REASON_EFFECT)
	end
end
function c12325.cfilter(c)
	return c:IsFaceup() and c:IsCode(15259703)
end
function c12325.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c12325.cfilter,tp,LOCATION_ONFIELD,0,1,nil)
end