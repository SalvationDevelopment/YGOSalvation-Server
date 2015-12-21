--金満な壺
function c80100263.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TODECK+CATEGORY_DRAW)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,80100263)
	e1:SetTarget(c80100263.target)
	e1:SetOperation(c80100263.operation)
	c:RegisterEffect(e1)
	if not c80100263.global_check then
		c80100263.global_check=true
		local ge1=Effect.CreateEffect(c)
		ge1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge1:SetCode(EVENT_SPSUMMON_SUCCESS)
		ge1:SetOperation(c80100263.checkop)
		Duel.RegisterEffect(ge1,0)
	end
end
function c80100263.checkop(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	while tc do
		local sump=tc:GetSummonPlayer()
		if not tc:GetSummonType()==SUMMON_TYPE_PENDULUM and Duel.GetFlagEffect(sump,80100263)==0 then
			Duel.RegisterFlagEffect(sump,80100263,RESET_PHASE+PHASE_END,0,1)
		end
		tc=eg:GetNext()
	end
end
function c80100263.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80100263)==0 end
	--oath effects
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
	e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e1:SetReset(RESET_PHASE+PHASE_END)
	e1:SetTargetRange(1,0)
	e1:SetTarget(c80100263.splimit)
	Duel.RegisterEffect(e1,tp)
end
function c80100263.splimit(e,c,sump,sumtype,sumpos,targetp,se)
	return sumtype~=SUMMON_TYPE_PENDULUM
end
function c80100263.filter(c)
	return c:IsType(TYPE_PENDULUM) and c:IsFaceup() and c:IsAbleToDeck()
end
function c80100263.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE+LOCATION_EXTRA) and chkc:IsControler(tp) and c80100263.filter(chkc) end
	if chk==0 then return Duel.IsPlayerCanDraw(tp,2)
		and Duel.IsExistingTarget(c80100263.filter,tp,LOCATION_GRAVE+LOCATION_EXTRA,0,3,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
	local g=Duel.SelectTarget(tp,c80100263.filter,tp,LOCATION_GRAVE+LOCATION_EXTRA,0,3,3,nil)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g,g:GetCount(),0,0)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,2)
end
function c80100263.operation(e,tp,eg,ep,ev,re,r,rp)
	local tg=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	if not tg then return end
	Duel.SendtoDeck(tg,nil,0,REASON_EFFECT)
	local g=Duel.GetOperatedGroup()
	local ct=g:FilterCount(Card.IsLocation,nil,LOCATION_DECK+LOCATION_EXTRA)
	
	Duel.ShuffleDeck(tp)
	Duel.BreakEffect()
	Duel.Draw(tp,2,REASON_EFFECT)

end
