--光子竜降臨
function c80800062.initial_effect(c)
	aux.AddRitualProcEqual(c,aux.FilterBoolFunction(Card.IsCode,80800045))
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetRange(LOCATION_GRAVE)
	e1:SetCost(c80800062.cost)
	e1:SetTarget(c80800062.target)
	e1:SetOperation(c80800062.activate)
	c:RegisterEffect(e1)
end
function c80800062.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToRemoveAsCost() end
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_COST)
end
function c80800062.mfilter1(c,e)
	return c:IsType(TYPE_MONSTER) and c:GetLevel()>0 and c:IsAbleToRemove() and not c:IsImmuneToEffect(e) 
end
function c80800062.filter(c,e,tp,m)
	if not c:IsCode(80800045) or not c:IsCanBeSpecialSummoned(e,SUMMON_TYPE_RITUAL,tp,true,false) then return false end
	return m:CheckWithSumEqual(Card.GetLevel,4,1,c)
end
function c80800062.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then
		if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return false end
		local mg=Duel.GetMatchingGroup(c80800062.mfilter1,tp,LOCATION_GRAVE,0,nil,e)
		return Duel.IsExistingMatchingCard(c80800062.filter,tp,LOCATION_HAND,0,1,nil,e,tp,mg)
	end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_HAND)
end
function c80800062.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	local mg=Duel.GetMatchingGroup(c80800062.mfilter1,tp,LOCATION_GRAVE,0,nil,e)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local tg=Duel.SelectMatchingCard(tp,c80800062.filter,tp,LOCATION_HAND,0,1,1,nil,e,tp,mg)
	if tg:GetCount()>0 then
		local tc=tg:GetFirst()
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RELEASE)
		local mat=mg:SelectWithSumEqual(tp,Card.GetRitualLevel,tc:GetLevel(),1,99,tc)
		tc:SetMaterial(mat)
		Duel.Remove(mat,POS_FACEUP,REASON_EFFECT)
		Duel.BreakEffect()
		Duel.SpecialSummon(tc,SUMMON_TYPE_RITUAL,tp,tp,true,false,POS_FACEUP)
		tc:CompleteProcedure()
	end
end

