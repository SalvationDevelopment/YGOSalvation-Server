--Toon Roll-Back
function c12324.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TODECK+CATEGORY_DRAW)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(TIMING_ATTACK,TIMING_END_PHASE+TIMING_ATTACK)	
	e1:SetTarget(c12324.target)
	e1:SetOperation(c12324.activate)
	c:RegisterEffect(e1)
end
function c12324.filter(c)
	return c:IsFaceup() and c:IsSetCard(0x62) and c:IsAbleToDeck()
end
function c12324.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsPlayerCanDraw(tp,3)
		and Duel.IsExistingMatchingCard(c12324.filter,tp,LOCATION_MZONE,0,2,e:GetHandler()) end
	Duel.SetTargetPlayer(tp)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,nil,2,tp,LOCATION_MZONE)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,3)
end
function c12324.activate(e,tp,eg,ep,ev,re,r,rp)
	local p=Duel.GetChainInfo(0,CHAININFO_TARGET_PLAYER)
	local g=Duel.GetMatchingGroup(c12324.filter,p,LOCATION_MZONE,0,nil)
	if g:GetCount()<2 then
		local hg=Duel.GetFieldGroup(p,LOCATION_MZONE,0)
		Duel.ConfirmCards(1-p,hg)
		Duel.ShuffleHand(p)
	else
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
		local sg=g:Select(p,2,2,nil)
		Duel.ConfirmCards(1-p,sg)
		Duel.SendtoDeck(sg,nil,2,REASON_EFFECT)
		Duel.ShuffleDeck(p)
		Duel.BreakEffect()
		Duel.Draw(p,3,REASON_EFFECT)
	end
end
