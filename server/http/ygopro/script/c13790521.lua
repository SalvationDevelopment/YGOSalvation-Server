--Card of Red Jewel
function c13790521.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DRAW)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,13790521)
	e1:SetCost(c13790521.cost)
	e1:SetTarget(c13790521.target)
	e1:SetOperation(c13790521.activate)
	c:RegisterEffect(e1)
end
function c13790521.filter(c)
	return c:GetLevel()==7 and c:IsSetCard(0x3b) and c:IsAbleToGrave()
end
function c13790521.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790521.filter,tp,LOCATION_HAND,0,1,nil) end
	Duel.DiscardHand(tp,c13790521.filter,1,1,REASON_COST+REASON_DISCARD)
end
function c13790521.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDraw(tp,2) end
	Duel.SetTargetPlayer(tp)
	Duel.SetTargetParam(2)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,2)
end
function c13790521.activate(e,tp,eg,ep,ev,re,r,rp)
	local p,d=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER,CHAININFO_TARGET_PARAM)
	Duel.Draw(p,d,REASON_EFFECT)
	if Duel.IsExistingMatchingCard(c13790521.filter,tp,LOCATION_DECK,0,1,nil) and Duel.SelectYesNo(tp,aux.Stringid(13790521,0)) then
		local g=Duel.SelectMatchingCard(tp,c13790521.filter,tp,LOCATION_DECK,0,1,1,nil)
		if g:GetCount()>0 then
			Duel.SendtoGrave(g,REASON_EFFECT)
		end	
	end
end
