--Crystal Rose
function c13790512.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetTarget(c13790512.target)
	e1:SetOperation(c13790512.activate)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetCountLimit(1,13790512)
	e2:SetCost(c13790512.spcost)
	e2:SetTarget(c13790512.sptarget)
	e2:SetOperation(c13790512.spoperation)
	c:RegisterEffect(e2)
end
function c13790512.cfilter(c)
	return c:IsType(TYPE_MONSTER) and (c:IsSetCard(0x9b) or c:IsSetCard(0x1047)) and c:IsAbleToGrave()
end
function c13790512.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790512.cfilter,tp,LOCATION_DECK+LOCATION_HAND,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK+LOCATION_HAND)
end
function c13790512.activate(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsFaceup() then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
		local g=Duel.SelectMatchingCard(tp,c13790512.cfilter,tp,LOCATION_DECK+LOCATION_HAND,0,1,1,nil)
		if g:GetCount()>0 and Duel.SendtoGrave(g,REASON_EFFECT) then
			local e1=Effect.CreateEffect(e:GetHandler())
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_CHANGE_CODE)
			e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
			e1:SetValue(g:GetFirst():GetCode())
			c:RegisterEffect(e1)
		end
	end
end
function c13790512.costfilter(c)
	return c:IsType(TYPE_FUSION) and c:IsAbleToRemoveAsCost()
end
function c13790512.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790512.costfilter,tp,LOCATION_GRAVE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c13790512.costfilter,tp,LOCATION_GRAVE,0,1,1,nil)
	Duel.Remove(g,POS_FACEUP,REASON_COST)
end
function c13790512.sptarget(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c13790512.spoperation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) then
		Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP_DEFENCE)
	end
end
