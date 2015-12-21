--Edge Imp Saw
function c13790429.initial_effect(c)
	--send to grave
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOGRAVE)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetCountLimit(1,13790429)
	e1:SetTarget(c13790429.target)
	e1:SetOperation(c13790429.operation)
	c:RegisterEffect(e1)
end
function c13790429.tgfilter(c)
	return c:IsSetCard(0xa9) and c:IsAbleToGrave()
end
function c13790429.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790429.tgfilter,tp,LOCATION_HAND,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,tp,LOCATION_HAND)
end
function c13790429.operation(e,tp,eg,ep,ev,re,r,rp)
	local p=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local gr=Duel.SelectMatchingCard(tp,c13790429.tgfilter,tp,LOCATION_HAND,0,1,1,nil)
	if gr:GetCount()>0 and Duel.SendtoGrave(gr,REASON_COST) then
		Duel.Draw(tp,2,REASON_EFFECT)
	end
	Duel.BreakEffect()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
	local tc=Duel.SelectMatchingCard(tp,Card.IsAbleToDeckAsCost,tp,LOCATION_HAND,0,1,1,nil)
	local opt=Duel.SelectOption(tp,aux.Stringid(13790429,0),aux.Stringid(13790429,1))
		Duel.SendtoDeck(tc,nil,opt,REASON_EFFECT)
end
