function c80100004.initial_effect(c)
	--atk limit
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_ATTACK)
	e1:SetCondition(c80100004.atcon)
	c:RegisterEffect(e1)
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80100004,0))
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetTarget(c80100004.sptg)
	e2:SetOperation(c80100004.spop)
	c:RegisterEffect(e2)
	--ret&draw
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100004,1))
	e3:SetCategory(CATEGORY_TODECK+CATEGORY_DRAW)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetRange(LOCATION_MZONE)
	e3:SetTarget(c80100004.drtg)
	e3:SetOperation(c80100004.drop)
	e3:SetCountLimit(1)
	c:RegisterEffect(e3)
end
function c80100004.atcon(e,c)
	return not(Duel.GetFieldGroupCount(tp,LOCATION_MZONE,0)==3 and Duel.GetMatchingGroupCount(c80100004.atkfilter,tp,LOCATION_MZONE,0,nil)==3)
end
function c80100004.atkfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x107a)
end
function c80100004.spfilter(c,e,tp)
	return c:IsSetCard(0x107a) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80100004.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80100004.spfilter,tp,LOCATION_HAND,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,2,tp,LOCATION_HAND)
end
function c80100004.spop(e,tp,eg,ep,ev,re,r,rp)
	local ft=Duel.GetLocationCount(tp,LOCATION_MZONE)
	if ft<=0 then return end
	if ft>2 then ft=2 end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c80100004.spfilter,tp,LOCATION_HAND,0,1,ft,nil,e,tp)
	if g:GetCount()~=0 then
		Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
	end
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
	e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e1:SetReset(RESET_PHASE+PHASE_END)
	e1:SetTargetRange(1,0)
	e1:SetTarget(c80100004.splimit)
	Duel.RegisterEffect(e1,tp)
end
function c80100004.splimit(e,c,sump,sumtype,sumpos,targetp,se)
	return not c:IsSetCard(0x107a)
end
function c80100004.drfilter(c)
	return (c:IsSetCard(0x107a) or c:IsSetCard(0x207a)) and c:IsAbleToDeck()
end
function c80100004.drtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c80100004.drfilter(chkc) end
	if chk==0 then return Duel.IsPlayerCanDraw(tp,1) and Duel.IsExistingTarget(c80100004.drfilter,tp,LOCATION_GRAVE,0,3,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
	local g=Duel.SelectTarget(tp,c80100004.drfilter,tp,LOCATION_GRAVE,0,3,3,nil)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g,g:GetCount(),0,0)
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,1)
end
function c80100004.tgfilter(c,e)
	return not c:IsRelateToEffect(e)
end
function c80100004.drop(e,tp,eg,ep,ev,re,r,rp)
	local tg=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	if tg:IsExists(c80100004.tgfilter,1,nil,e) then return end
	Duel.SendtoDeck(tg,nil,0,REASON_EFFECT)
	Duel.ShuffleDeck(tp)
	Duel.BreakEffect()
	Duel.Draw(tp,1,REASON_EFFECT)
end