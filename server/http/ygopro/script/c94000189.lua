--Crystal Rose
function c94000189.initial_effect(c)
    --copy
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TOGRAVE)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetTarget(c94000189.tg)
	e1:SetOperation(c94000189.op)
	c:RegisterEffect(e1)
	--spsummon
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetCountLimit(1,94000189)
	e2:SetCost(c94000189.spcost)
	e2:SetTarget(c94000189.sptg)
	e2:SetOperation(c94000189.spop)
	c:RegisterEffect(e2)
end
function c94000189.filter(c)
    return (c:IsSetCard(0x1047) or c:IsSetCard(0x9b)) and c:IsType(TYPE_MONSTER) and c:IsAbleToGrave()
end
function c94000189.tg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.IsExistingMatchingCard(c94000189.filter,tp,LOCATION_HAND+LOCATION_DECK,0,1,nil) end 
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,g,1,tp,LOCATION_DECK+LOCATION_HAND)
end
function c94000189.op(e,ep,eg,ep,ev,re,r,rp)
    Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.SelectMatchingCard(tp,c94000189.filter,tp,LOCATION_HAND+LOCATION_DECK,0,1,1,nil)
	local tc=g:GetFirst()
	if g:GetCount()>0 then 
	    Duel.SendtoGrave(g,REASON_EFFECT)
		if tc:IsLocation(LOCATION_GRAVE) then 
		    local e1=Effect.CreateEffect(e:GetHandler())
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_CHANGE_CODE)
			e1:SetValue(tc:GetCode())
			e1:SetReset(RESET_PHASE+PHASE_END+RESET_EVENT+0x1fe0000)
			e:GetHandler():RegisterEffect(e1)
		end
	end
end
function c94000189.refilter(c)
    return c:IsType(TYPE_FUSION) and c:IsAbleToRemoveAsCost()
end
function c94000189.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.IsExistingMatchingCard(c94000189.refilter,tp,LOCATION_GRAVE,0,1,nil) end 
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c94000189.refilter,tp,LOCATION_GRAVE,0,1,1,nil)
	Duel.Remove(g,POS_FACEUP,REASON_COST)
end
function c94000189.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false,POS_FACEUP_DEFENCE) and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 end 
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),nil,0,0)
end
function c94000189.spop(e,tp,eg,ep,ev,re,r,rp)
    if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return false end 
    local c=e:GetHandler()
	if c:IsRelateToEffect(e) then 
        Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP_DEFENCE)
	end
end