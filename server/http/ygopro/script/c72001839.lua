--Friendly Fire
--By: HelixReactor
function c72001839.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_CHAINING)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCondition(c72001839.condition)
	e1:SetTarget(c72001839.target)
	e1:SetOperation(c72001839.activate)
	c:RegisterEffect(e1)
end
function c72001839.condition(e,tp,eg,ep,ev,re,r,rp)
	return rp~=tp
end
function c72001839.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(1-tp) and chkc:IsDestructable() and chkc~=re:GetHandler() end
	if chk==0 then return Duel.IsExistingTarget(Card.IsDestructable,tp,0,LOCATION_ONFIELD,1,re:GetHandler()) end
	Duel.SelectTarget(tp,Card.IsDestructable,tp,0,LOCATION_ONFIELD,1,1,re:GetHandler())
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,eg,1,0,0)
end
function c72001839.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then Duel.Destroy(tc,REASON_EFFECT) end
end