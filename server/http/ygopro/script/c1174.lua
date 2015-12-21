--森のざわめき
function c1174.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_POSITION+CATEGORY_TOHAND)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c1174.target)
	e1:SetOperation(c1174.activate)
	c:RegisterEffect(e1)
end
function c1174.filter(c)
	return c:IsFaceup() and c:IsCanTurnSet()
end
function c1174.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(1-tp) and chkc:IsLocation(LOCATION_MZONE) and c1174.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c1174.filter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	local g=Duel.SelectTarget(tp,c1174.filter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,1,0,0)
end
function c1174.rfilter(c)
	return c:GetSequence()==5 and c:IsAbleToHand()
end
function c1174.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsControler(1-tp) and tc:IsFaceup() then
		Duel.ChangePosition(tc,POS_FACEDOWN_DEFENCE)
		local rg=Duel.GetMatchingGroup(c1174.rfilter,tp,LOCATION_SZONE,LOCATION_SZONE,nil)
		if rg:GetCount()~=0 and Duel.SelectYesNo(tp,aux.Stringid(1174,0)) then
			Duel.BreakEffect()
			Duel.SendtoHand(rg,nil,REASON_EFFECT)
		end
	end
end
