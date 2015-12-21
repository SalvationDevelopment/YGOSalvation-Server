--Orichalcos Mirror
function c123105.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c123105.target)
	e1:SetOperation(c123105.activate)
	c:RegisterEffect(e1)
end
function c123105.filter(c,e,tp,m)
	if c:GetCode()~=123107 or not c:IsCanBeSpecialSummoned(e,SUMMON_TYPE_RITUAL,tp,true,false) then return false end
	local result=false
	if m:IsContains(c) then
		m:RemoveCard(c)
		result=m:CheckWithSumGreater(Card.GetRitualLevel,c:GetOriginalLevel(),c)
		m:AddCard(c)
	else
		result=m:CheckWithSumGreater(Card.GetRitualLevel,c:GetOriginalLevel(),c)
	end
	return result
end
function c123105.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then
		if Duel.GetLocationCount(tp,LOCATION_MZONE)==0 then return false end
		local mg=Duel.GetRitualMaterial(tp,nil)
		return Duel.IsExistingMatchingCard(c123105.filter,tp,LOCATION_HAND,0,1,nil,e,tp,mg)
	end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_HAND)
end
function c123105.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)==0 then return end
	local mg=Duel.GetRitualMaterial(tp,nil)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local tg=Duel.SelectMatchingCard(tp,c123105.filter,tp,LOCATION_HAND,0,1,1,nil,e,tp,mg)
	if tg:GetCount()>0 then
		local tc=tg:GetFirst()
		mg:RemoveCard(tc)
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RELEASE)
		local mat=mg:SelectWithSumGreater(tp,Card.GetRitualLevel,tc:GetOriginalLevel(),tc)
		tc:SetMaterial(mat)
		Duel.ReleaseRitualMaterial(mat)
		Duel.BreakEffect()
		Duel.SpecialSummon(tc,SUMMON_TYPE_RITUAL,tp,tp,true,false,POS_FACEUP)
		tc:CompleteProcedure()
	end
end
