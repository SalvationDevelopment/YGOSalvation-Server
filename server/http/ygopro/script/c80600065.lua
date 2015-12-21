--貪欲で無欲な壺
function c80600065.initial_effect(c)
  --Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TODECK+CATEGORY_DRAW)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c80600065.condition)
	e1:SetCost(c80600065.cost)
	e1:SetTarget(c80600065.target)
	e1:SetOperation(c80600065.activate)
	c:RegisterEffect(e1)
end
function c80600065.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetCurrentPhase()==PHASE_MAIN1 and not Duel.CheckPhaseActivity()
end
function c80600065.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetCurrentPhase()~=PHASE_MAIN2 end
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_BP)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
	e1:SetTargetRange(1,0)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
end
function c80600065.filter(c)
	return c:IsType(TYPE_MONSTER) and c:IsAbleToDeck() and Duel.IsExistingTarget(c80600065.filter1,tp,LOCATION_GRAVE,0,1,nil,c:GetRace())
end

function c80600065.filter1(c,t)
	return c:IsType(TYPE_MONSTER) and not c:IsRace(t) and c:IsAbleToDeck() and Duel.IsExistingTarget(c80600065.filter2,tp,LOCATION_GRAVE,0,1,nil,t,c:GetRace())
end

function c80600065.filter2(c,t1,t2)
	return c:IsType(TYPE_MONSTER) and not c:IsRace(t1) and not c:IsRace(t2) and c:IsAbleToDeck() 
end

function c80600065.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c80600065.filter(chkc) end
	if chk==0 then return Duel.IsPlayerCanDraw(tp,2)
		and Duel.IsExistingTarget(c80600065.filter,tp,LOCATION_GRAVE,0,1,nil) end
	local g=Duel.GetMatchingGroup(Card.IsType,tp,LOCATION_GRAVE,0,nil,TYPE_MONSTER)
	local cg=Group.CreateGroup()
	for i=1,3 do
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
		local sg=g:Select(tp,1,1,nil)
		g:Remove(Card.IsRace,nil,sg:GetFirst():GetRace())
		Duel.SetTargetCard(sg:GetFirst())
		cg:Merge(sg)
	end

	Duel.SetOperationInfo(0,CATEGORY_TODECK,cg,cg:GetCount(),0,0)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,2)
end
function c80600065.activate(e,tp,eg,ep,ev,re,r,rp)
	local tg=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	if not tg or tg:FilterCount(Card.IsRelateToEffect,nil,e)~=3 then return end
	Duel.SendtoDeck(tg,nil,0,REASON_EFFECT)
	local g=Duel.GetOperatedGroup()
	local ct=g:FilterCount(Card.IsLocation,nil,LOCATION_DECK+LOCATION_EXTRA)
	if ct==3 then
		Duel.ShuffleDeck(tp)
		Duel.BreakEffect()
		Duel.Draw(tp,2,REASON_EFFECT)
	end
end
