--Card of Red Jewel
function c94000191.initial_effect(c)
    --Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DRAW)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,94000191+EFFECT_COUNT_CODE_OATH)
	e1:SetCost(c94000191.cost)
	e1:SetTarget(c94000191.target)
	e1:SetOperation(c94000191.activate)
	c:RegisterEffect(e1)
end
function c94000191.filter(c)
    return c:IsSetCard(0x3b) and c:GetLevel()==7 and c:IsAbleToGraveAsCost()
end
function c94000191.tgfilter(c)
    return c:IsSetCard(0x3b) and c:GetLevel()==7 and c:IsAbleToGrave()
end
function c94000191.cost(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.IsExistingMatchingCard(c94000191.filter,tp,LOCATION_HAND,0,1,nil) end 
	Duel.Hint(HINT_SELECTMGS,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c94000191.filter,tp,LOCATION_HAND,0,1,1,nil)
	Duel.SendtoGrave(g,REASON_COST)
end
function c94000191.target(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.IsPlayerCanDraw(tp,2) end 
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(2)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,0,0,tp,2)
end
function c94000191.activate(e,tp,eg,ep,ev,re,r,rp)
    local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Draw(p,d,REASON_EFFECT)
	Duel.BreakEffect()
	if Duel.IsExistingMatchingCard(c94000191.tgfilter,tp,LOCATION_DECK,0,1,nil) and Duel.SelectYesNo(tp,aux.Stringid(94000191,0)) then 
	    Duel.Hint(HINT_SELECTMGS,tp,HINTMSG_TOGRAVE)
		local g=Duel.SelectMatchingCard(tp,c94000191.tgfilter,tp,LOCATION_DECK,0,1,1,nil)
		Duel.SendtoGrave(g,REASON_EFFECT)
	end
end