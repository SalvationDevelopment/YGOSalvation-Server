--Trick Box
function c94000204.initial_effect(c)
    --Activation
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON+CATEGORY_CONTROL)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_TO_GRAVE)
	e1:SetCondition(c94000204.condition)
	e1:SetTarget(c94000204.target)
	e1:SetOperation(c94000204.activate)
	c:RegisterEffect(e1)
end
function c94000204.filter1(c,tp)
    return c:IsSetCard(0x24ba) and (c:IsReason(REASON_BATTLE) or c:IsReason(REASON_EFFECT)) and c:GetPreviousControler()==tp
end
function c94000204.filter2(c)
    return c:IsAbleToChangeControler()
end
function c94000204.spfilter(c,e,tp)
    return c:IsSetCard(0x24ba) and c:IsAbleToChangeControler() and c:IsCanBeSpecialSummoned(e,0,1-tp,false,false)
end
function c94000204.condition(e,tp,eg,ep,ev,re,r,rp)
    return eg:IsExists(c94000204.filter1,1,nil,tp)
end
function c94000204.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
    if chkc then return chkc:IsControler(1-tp) and chkc:IsAbleToChangeControler() and chkc:IsLocation(LOCATION_MZONE) end
    if chk==0 then return Duel.IsExistingTarget(c94000204.filter2,tp,0,LOCATION_MZONE,1,nil) and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 end 
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CONTROL)
	local g=Duel.SelectTarget(tp,c94000204.filter2,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_CONTROL,g,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_GRAVE)
end
function c94000204.activate(e,tp,eg,ep,ev,re,r,rp)
    if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return false end 
    local tc=Duel.GetFirstTarget()
	if Duel.GetControl(tc,tp,PHASE_END,1) then
	    Duel.BreakEffect()
        Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local g=Duel.SelectMatchingCard(tp,c94000204.spfilter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
		if g:GetCount()>0 then 
		    Duel.SpecialSummon(g,0,tp,1-tp,false,false,POS_FACEUP)
			local tc2=g:GetFirst()
			local e1=Effect.CreateEffect(e:GetHandler())
			e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
			e1:SetCode(EVENT_PHASE+PHASE_END)
			e1:SetCountLimit(1)
			e1:SetLabelObject(tc2)
			e1:SetOperation(c94000204.controlop)
			e1:SetReset(RESET_PHASE+PHASE_END+RESET_EVENT+0x1fe0000)
			Duel.RegisterEffect(e1,tp)			
		end
	else 
	    if not tc:IsImmuneToEffect(e) and tc:IsAbleToChangeControler() then
			Duel.Destroy(tc,REASON_EFFECT)
		end
	end
end
function c94000204.controlop(e,tp,eg,ep,ev,re,r,rp)
    if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return true end 
	local tc=e:GetLabelObject()
	if tc then Duel.GetControl(tc,tp) end
end