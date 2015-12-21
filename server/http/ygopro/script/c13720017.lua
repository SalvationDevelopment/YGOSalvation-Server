--Red-Eyes Transmigration
function c13720017.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c13720017.RPGTarget(filter))
	e1:SetOperation(c13720017.RPGOperation(filter))
	c:RegisterEffect(e1)
end
function c13720017.mfilter(c)
	return c:IsSetCard(0x3b) and c:IsType(TYPE_MONSTER) and c:IsAbleToRemove()
end
function c13720017.RPGFilter(c,filter,e,tp,m)
	if not c:IsCode(13720016) or not c:IsCanBeSpecialSummoned(e,SUMMON_TYPE_RITUAL,tp,true,false) then return false end
	local result=false
	if m:IsContains(c) then
		mg2=Duel.GetMatchingGroup(c13720017.mfilter,tp,LOCATION_GRAVE,0,nil)
		m:Merge(mg2)
		m:RemoveCard(c)
		result=m:CheckWithSumGreater(Card.GetRitualLevel,c:GetOriginalLevel(),c)
		m:AddCard(c)
	else
		mg2=Duel.GetMatchingGroup(c13720017.mfilter,tp,LOCATION_GRAVE,0,nil)
		m:Merge(mg2)
		result=m:CheckWithSumGreater(Card.GetRitualLevel,c:GetOriginalLevel(),c)
	end
	return result
end
function c13720017.RPGTarget(filter)
	return	function(e,tp,eg,ep,ev,re,r,rp,chk)
				if chk==0 then
					local mg=Duel.GetRitualMaterial(tp)
					return Duel.IsExistingMatchingCard(c13720017.RPGFilter,tp,LOCATION_HAND,0,1,nil,filter,e,tp,mg)
				end
				Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_HAND)
			end
end
function c13720017.RPGOperation(filter)
	return	function(e,tp,eg,ep,ev,re,r,rp)
				local mg=Duel.GetRitualMaterial(tp)
				Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
				local tg=Duel.SelectMatchingCard(tp,c13720017.RPGFilter,tp,LOCATION_HAND,0,1,1,nil,filter,e,tp,mg)
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
end
