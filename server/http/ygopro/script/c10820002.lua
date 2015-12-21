--Superheavy Samurai Tamashii
function c80100504.initial_effect(c)
--synchro custom
local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1,80100504)
	e1:SetCondition(c80100504.cn)
	e1:SetTarget(c80100504.tg)
	e1:SetOperation(c80100504.op)
	c:RegisterEffect(e1)
end
function c80100504.cfilter(c)
	return c:IsFacedown() or not c:IsSetCard(0x9a)
end
function c80100504.filter(c)
	return c:IsType(TYPE_SPELL+TYPE_TRAP)
end
function c80100504.tgfilter(c,e,tp)
	local lv1=c:GetLevel()
	local lv2=e:GetHandler():GetLevel()
	return c:IsAbleToGrave() and Duel.IsExistingMatchingCard(c80100504.synfilter,tp,LOCATION_EXTRA,0,1,nil,lv1+lv2,e,tp)
end
function c80100504.synfilter(c,lv,e,tp)
	return c:IsSetCard(0x9a) and c:GetLevel()==lv and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80100504.cn(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()==tp
		and not Duel.IsExistingMatchingCard(c80100504.cfilter,tp,LOCATION_MZONE,0,1,nil)
		and not Duel.IsExistingMatchingCard(c80100504.filter,tp,LOCATION_GRAVE,0,1,nil)
end
function c80100504.tg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and c80100504.tgfilter(chkc,e,tp) end
	if chk==0 then return Duel.IsExistingTarget(c80100504.tgfilter,tp,0,LOCATION_MZONE,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectTarget(tp,c80100504.tgfilter,tp,0,LOCATION_MZONE,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,g,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c80100504.op(e,tp,eg,ep,ev,re,r,rp)
if Duel.GetLocationCount(tp,LOCATION_MZONE)<0 then return end
local g=Duel.GetFirstTarget()
local f=e:GetHandler()
local lv=g:GetLevel()+f:GetLevel()
Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
local t=Duel.SelectMatchingCard(tp,c80100504.synfilter,tp,LOCATION_EXTRA,0,1,1,nil,lv,e,tp)
local sc=t:GetFirst()
	if sc then
	Duel.SendtoGrave(g,REASON_EFFECT)
	Duel.SendtoGrave(f,REASON_EFFECT)
	end
if g and f and f:IsLocation(LOCATION_GRAVE) and g:IsLocation(LOCATION_GRAVE) then 
	Duel.SpecialSummon(sc,SUMMON_TYPE_SYNCHRO,tp,tp,false,false,POS_FACEUP)
	sc:CompleteProcedure()
	end
end