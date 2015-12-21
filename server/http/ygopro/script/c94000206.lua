--Red-Eyes Return 
function c94000206.initial_effect(c)
    --Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c94000206.target1)
	e1:SetOperation(c94000206.operation)
	c:RegisterEffect(e1)
	--spsummon 1
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCondition(c94000206.condition)
	e2:SetCost(c94000206.cost)
	e2:SetTarget(c94000206.target2)
	e2:SetOperation(c94000206.operation)
	c:RegisterEffect(e2)
	--spsummon 2
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DELAY)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_DESTROYED)
	e3:SetCountLimit(1,96000206)
	e3:SetCondition(c94000206.spcon)
	e3:SetTarget(c94000206.sptg)
	e3:SetOperation(c94000206.spop)
	c:RegisterEffect(e3)
end
function c94000206.spfilter(c,e,tp)
    return c:IsType(TYPE_NORMAL) and c:IsType(TYPE_MONSTER) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c94000206.filter(c)
    return c:IsFaceup() and c:IsSetCard(0x3b)
end
function c94000206.target1(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return true end 
	if Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and Duel.IsExistingMatchingCard(c94000206.filter,tp,LOCATION_MZONE,0,1,nil) 
	    and Duel.GetFlagEffect(tp,94000206)==0 
		and Duel.IsExistingTarget(c94000206.spfilter,tp,LOCATION_GRAVE,0,1,nil,e,tp)
		and Duel.SelectYesNo(tp,aux.Stringid(94000206,0)) then 
		    e:SetProperty(EFFECT_FLAG_CARD_TARGET)
		    e:SetCategory(CATEGORY_SPECIAL_SUMMON)
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
			local g=Duel.SelectTarget(tp,c94000206.spfilter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
			Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
			Duel.RegisterFlagEffect(tp,94000206,RESET_PHASE+PHASE_END,0,1)		
			e:SetLabel(1)
	end
end
function c94000206.condition(e,tp,eg,ep,ev,re,r,rp)
    return Duel.IsExistingMatchingCard(c94000206.filter,tp,LOCATION_MZONE,0,1,nil)
end
function c94000206.cost(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.GetFlagEffect(tp,94000206)==0 end 
	Duel.RegisterFlagEffect(tp,94000206,RESET_PHASE+PHASE_END,0,1)	
end
function c94000206.target2(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
    if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c94000206.spfilter(chkc,e,tp) end 
	if chk==0 then return Duel.IsExistingTarget(c94000206.spfilter,tp,LOCATION_GRAVE,0,1,nil,e,tp) and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 end 
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c94000206.spfilter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)	
	e:SetLabel(1)
end
function c94000206.operation(e,tp,eg,ep,ev,re,r,rp)
    if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 or Duel.GetFlagEffect(tp,94000206)==0 then return false end 
    local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if e:GetLabel()==1 then 
	    if not tc:IsRelateToEffect(e) or not c:IsRelateToEffect(e) then return false end 
	    Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
		e:SetLabel(0)
	end
end
function c94000206.spfilter2(c,e,tp)
    return c:IsType(TYPE_MONSTER) and c:IsSetCard(0x3b) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c94000206.spcon(e,tp,eg,ep,ev,re,r,rp)
    return rp~=tp and e:GetHandler():IsReason(REASON_EFFECT) and e:GetHandler():IsLocation(LOCATION_GRAVE)
end
function c94000206.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c94000206.spfilter2(chkc,e,tp) end 
	if chk==0 then return Duel.IsExistingTarget(c94000206.spfilter2,tp,LOCATION_GRAVE,0,1,nil,e,tp) and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 end 
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c94000206.spfilter2,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c94000206.spop(e,tp,eg,ep,ev,re,r,rp)
    if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return false end 
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
	    Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
	end
end