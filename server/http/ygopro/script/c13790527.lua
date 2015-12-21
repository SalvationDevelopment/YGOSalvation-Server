--Red-Eyes
function c13790527.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(13790527,0))
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,TIMING_END_PHASE)
	e1:SetTarget(c13790527.target1)
	e1:SetOperation(c13790527.activate)
	c:RegisterEffect(e1)
	--instant
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(13790527,0))
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetHintTiming(0,TIMING_END_PHASE)
	e2:SetLabel(1)
	e2:SetTarget(c13790527.target2)
	e2:SetOperation(c13790527.activate)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(13790527,1))
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e3:SetCode(EVENT_TO_GRAVE)
	e3:SetCountLimit(1,13790527)
	e3:SetCondition(c13790527.spcon)
	e3:SetTarget(c13790527.sptg)
	e3:SetOperation(c13790527.spop)
	c:RegisterEffect(e3)
end
function c13790527.refilter(c,e,tp)
	return c:IsSetCard(0x3b) and c:IsFaceup()
end
function c13790527.filter(c,e,tp)
	return c:IsType(TYPE_NORMAL) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c13790527.target1(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_GRAVE) and c13790527.filter(chkc,e,tp) end
	if chk==0 then return true end 
	if Duel.GetFlagEffect(tp,13790527)==0 and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and 
	Duel.IsExistingTarget(c13790527.refilter,tp,LOCATION_MZONE,0,1,nil,e,tp) and Duel.IsExistingTarget(c13790527.filter,tp,LOCATION_GRAVE,0,1,nil,e,tp)
	and Duel.SelectYesNo(tp,aux.Stringid(13790527,0)) then
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c13790527.filter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
		e:SetLabel(1)
		Duel.RegisterFlagEffect(tp,13790527,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
	end
end
function c13790527.target2(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_GRAVE) and c13790527.filter(chkc,e,tp) end
	if chk==0 then return Duel.GetFlagEffect(tp,13790527)==0 and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and 
	Duel.IsExistingTarget(c13790527.refilter,tp,LOCATION_MZONE,0,1,nil,e,tp) and Duel.IsExistingTarget(c13790527.filter,tp,LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c13790527.filter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
		Duel.RegisterFlagEffect(tp,13790527,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
end
function c13790527.activate(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if e:GetLabel()~=1 or not c:IsRelateToEffect(e) then return end
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
	end
end

function c13790527.spcon(e,tp,eg,ep,ev,re,r,rp)
	return rp~=tp and bit.band(r,REASON_EFFECT)~=0
end
function c13790527.spfilter(c,e,tp)
	return c:IsSetCard(0x3b) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c13790527.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c13790527.spfilter,tp,LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_GRAVE)
end
function c13790527.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c13790527.spfilter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
	end
end
