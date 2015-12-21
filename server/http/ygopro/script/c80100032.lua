--光竜星－リフン
function c80100032.initial_effect(c)
	--Special Summon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80100032,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_CHAIN_UNIQUE)
	e1:SetCode(EVENT_TO_GRAVE)
	e1:SetCondition(c80100032.spcon)
	e1:SetCost(c80100032.spcost)
	e1:SetTarget(c80100032.sptg)
	e1:SetOperation(c80100032.spop)
	c:RegisterEffect(e1)
	--spsummon
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80100032,1))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_CHAIN_UNIQUE)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetCode(EVENT_TO_GRAVE)
	e2:SetCondition(c80100032.spcon1)
	e2:SetCost(c80100032.spcost1)
	e2:SetTarget(c80100032.sptg1)
	e2:SetOperation(c80100032.spop1)
	c:RegisterEffect(e2)
end
function c80100032.spcon(e,tp,eg,ep,ev,re,r,rp)
	return bit.band(r,REASON_DESTROY)~=0 and e:GetHandler():GetPreviousControler()==tp
		and e:GetHandler():IsPreviousLocation(LOCATION_ONFIELD)
end
function c80100032.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80100032)==0 end
	Duel.RegisterFlagEffect(tp,80100032,RESET_PHASE+PHASE_END,0,1)
end
function c80100032.filter(c,e,tp)
	return c:IsSetCard(0x9c) and c:GetCode()~=80100032 and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80100032.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80100032.filter,tp,LOCATION_DECK,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_DECK)
end
function c80100032.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c80100032.filter,tp,LOCATION_DECK,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP_DEFENCE)
	end
end
function c80100032.cfilter(c,h,tp)
	return c:IsPreviousLocation(LOCATION_MZONE) and c:GetPreviousControler()==tp
		and c:IsReason(REASON_DESTROY) and h:IsPreviousLocation(LOCATION_GRAVE) and c:IsSetCard(0x9c)
end
function c80100032.spcon1(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return eg:IsExists(c80100032.cfilter,1,c,c,tp)
end
function c80100032.spcost1(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80100132)==0 end
	Duel.RegisterFlagEffect(tp,80100132,RESET_PHASE+PHASE_END,0,1)
end
function c80100032.sptg1(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsRelateToEffect(e)
		and Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and c:IsCanBeSpecialSummoned(e,0,tp,false,false) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,c,1,0,0)
end
function c80100032.spop1(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)>0 then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_LEAVE_FIELD_REDIRECT)
		e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetReset(RESET_EVENT+0x47e0000)
		e1:SetValue(LOCATION_REMOVED)
		c:RegisterEffect(e1,true)
	end
end