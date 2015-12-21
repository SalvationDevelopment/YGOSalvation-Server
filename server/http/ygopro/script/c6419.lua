--Synchro Cracker
function c6419.initial_effect(c)
--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TODECK+CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c6419.target)
	e1:SetOperation(c6419.activate)
	c:RegisterEffect(e1)
end
function c6419.filter(c)
	return c:IsFaceup() and c:IsType(TYPE_SYNCHRO) and c:IsAbleToExtra()
end
function c6419.filter2(c,atk)
	return c:IsFaceup() and c:GetBaseAttack()<=atk and c:IsDestructable()
end
function c6419.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c6419.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c6419.filter,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
	local g=Duel.SelectTarget(tp,c6419.filter,tp,LOCATION_MZONE,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g,1,0,0)
end
function c6419.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	local atk=tc:GetAttack()
	local g=Duel.GetMatchingGroup(c6419.filter2,tp,0,LOCATION_MZONE,c,atk)
	if tc:IsFacedown() or not tc:IsRelateToEffect(e) then return end
	if Duel.SendtoDeck(tc,nil,0,REASON_EFFECT)~=0 then
	Duel.Destroy(g,REASON_EFFECT)
	else end
end