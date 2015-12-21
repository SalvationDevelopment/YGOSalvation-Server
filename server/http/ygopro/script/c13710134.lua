--The Original Monarch
function c13710134.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TODECK+CATEGORY_DRAW)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c13710134.target)
	e1:SetOperation(c13710134.activate)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(41930553,1))
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetHintTiming(0,TIMING_END_PHASE)
	e2:SetTarget(c13710134.target2)
	e2:SetOperation(c13710134.activate)
	c:RegisterEffect(e2)
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(13710134,0))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetCountLimit(1,13710134)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetCost(c13710134.cost)
	e2:SetTarget(c13710134.sptg)
	e2:SetOperation(c13710134.spop)
	c:RegisterEffect(e2)
end
function c13710134.filter(c)
	return c:IsSetCard(0xbe) and c:IsType(TYPE_SPELL+TYPE_TRAP) and c:IsAbleToDeck()
end
function c13710134.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c13710134.filter(chkc) end
	if chk==0 then return true end
	if Duel.IsPlayerCanDraw(tp,1) and e:GetHandler():GetFlagEffect(53670497)==0
		and Duel.IsExistingTarget(c13710134.filter,tp,LOCATION_GRAVE,0,2,nil) and Duel.SelectYesNo(tp,aux.Stringid(13710134,0)) then
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
	local g=Duel.SelectTarget(tp,c13710134.filter,tp,LOCATION_GRAVE,0,2,2,nil)
	end
	e:GetHandler():RegisterFlagEffect(13710134,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g,2,0,0)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,1)
end
function c13710134.target2(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c13710134.filter(chkc) end
	if chk==0 then return Duel.IsPlayerCanDraw(tp,1) and e:GetHandler():GetFlagEffect(13710134)==0
		and Duel.IsExistingTarget(c13710134.filter,tp,LOCATION_GRAVE,0,2,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
	local g=Duel.SelectTarget(tp,c13710134.filter,tp,LOCATION_GRAVE,0,2,2,nil)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g,2,0,0)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,1)
	e:GetHandler():RegisterFlagEffect(13710134,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
end
function c13710134.activate(e,tp,eg,ep,ev,re,r,rp)
	if e:GetHandler():GetFlagEffect(13710134)==0 then return false end
	local tg=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	if tg:FilterCount(Card.IsRelateToEffect,nil,e)~=2 then return end
	Duel.SendtoDeck(tg,nil,0,REASON_EFFECT)
	Duel.ShuffleDeck(tp)
	Duel.BreakEffect()
	Duel.Draw(tp,1,REASON_EFFECT)
end

function c13710134.costfilter(c)
	return c:IsSetCard(0xbe) and c:IsType(TYPE_SPELL+TYPE_TRAP) and c:IsAbleToRemoveAsCost()
end
function c13710134.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13710134.costfilter,tp,LOCATION_GRAVE,0,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c13710134.costfilter,tp,LOCATION_GRAVE,0,1,1,e:GetHandler())
	Duel.Remove(g,POS_FACEUP,REASON_COST)
end
function c13710134.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and e:GetHandler():GetFlagEffect(13710134)==0
		and Duel.IsPlayerCanSpecialSummonMonster(tp,13710134,0,0x11,5,1000,2400,RACE_FAIRY,ATTRIBUTE_LIGHT) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
	e:GetHandler():RegisterFlagEffect(13710134,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
end
function c13710134.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	local c=e:GetHandler()
	if c:IsRelateToEffect(e)
		and Duel.IsPlayerCanSpecialSummonMonster(tp,13710134,0,0x11,5,1000,2400,RACE_FAIRY,ATTRIBUTE_LIGHT) then
		c:SetStatus(STATUS_NO_LEVEL,false)
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_CHANGE_TYPE)
		e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetValue(TYPE_NORMAL+TYPE_MONSTER)
		e1:SetReset(RESET_EVENT+0x47c0000)
		c:RegisterEffect(e1,true)
		Duel.SpecialSummon(c,0,tp,tp,true,false,POS_FACEUP_DEFENCE)
	end
end

