--Odd-Eyes Vortex Dragon
function c13720107.initial_effect(c)
	--fusion material
	c:EnableReviveLimit()
	aux.AddFusionProcFun2(c,c13720107.ffilter,aux.FilterBoolFunction(Card.IsType,TYPE_PENDULUM),false)
	--to hand
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(13720107,0))
	e1:SetCategory(CATEGORY_TOHAND)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetCountLimit(1,13720107)
	e1:SetTarget(c13720107.thtg)
	e1:SetOperation(c13720107.thop)
	c:RegisterEffect(e1)
	--to deck and negate
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(13720107,1))
	e2:SetCategory(CATEGORY_TODECK+CATEGORY_NEGATE)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_CHAINING)
	e2:SetCountLimit(1,13720108)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DAMAGE_CAL)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCondition(c13720107.codisable)
	e2:SetTarget(c13720107.tgdisable)
	e2:SetOperation(c13720107.opdisable)
	c:RegisterEffect(e2)
end
function c13720107.ffilter(c)
	return c:IsSetCard(0x99)
end
function c13720107.filter(c)
	return c:IsAbleToHand() and c:IsPosition(POS_FACEUP_ATTACK)
end
function c13720107.thtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return Duel.IsExistingMatchingCard(c13720107.filter,tp,0,LOCATION_MZONE,1,nil) end
	if chk==0 then return Duel.IsExistingTarget(c13720107.filter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RTOHAND)
	local g=Duel.SelectTarget(tp,c13720107.filter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,1,0,0)
end
function c13720107.thop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
	end
end
function c13720107.filter2(c)
	return c:IsAbleToDeck() and c:IsType(TYPE_PENDULUM)
end
function c13720107.codisable(e,tp,eg,ep,ev,re,r,rp)
	return (re:IsHasType(EFFECT_TYPE_ACTIVATE) or re:IsActiveType(TYPE_MONSTER))
	and re:GetHandler()~=e:GetHandler() and Duel.IsChainNegatable(ev) and not e:GetHandler():IsStatus(STATUS_BATTLE_DESTROYED)
end
function c13720107.tgdisable(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_EXTRA) and chkc:IsControler(tp) and c13720107.filter2(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13720107.filter2,tp,LOCATION_EXTRA,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
	local g=Duel.SelectTarget(tp,c13720107.filter2,tp,LOCATION_EXTRA,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g,g:GetCount(),0,0)
	Duel.SetOperationInfo(0,CATEGORY_NEGATE,eg,1,0,0)
end
function c13720107.opdisable(e,tp,eg,ep,ev,re,r,rp)
	local tg=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	if not tg or tg:FilterCount(Card.IsRelateToEffect,nil,e)~=1 then return end
	Duel.SendtoDeck(tg,nil,0,REASON_EFFECT)
	local g=Duel.GetOperatedGroup()
	local ct=g:FilterCount(Card.IsLocation,nil,LOCATION_DECK+LOCATION_EXTRA)
	if ct==1 then
		Duel.ShuffleDeck(tp)
		Duel.NegateActivation(ev)
		if re:GetHandler():IsRelateToEffect(re) then
			Duel.Destroy(eg,REASON_EFFECT)
		end
	end
end
