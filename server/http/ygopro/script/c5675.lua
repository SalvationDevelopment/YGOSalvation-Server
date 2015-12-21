--The Fang of Critias(for Percy Cards)
function c5675.initial_effect(c)
    --Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,5675+EFFECT_COUNT_CODE_OATH)
	e1:SetTarget(c5675.target)
	e1:SetOperation(c5675.activate)
	c:RegisterEffect(e1)
end
c5675.list={[44095762]=5693,[13790568]=13790566,[57728570]=13790565}
function c5675.filter(c,e,tp)
    local code=c:GetCode()
	local tcode=c5675.list[code]
	return tcode and Duel.IsExistingMatchingCard(c5675.spfilter,tp,LOCATION_EXTRA,0,1,nil,e,tp,tcode)
end
function c5675.spfilter(c,e,tp,tcode)
    return c:IsCode(tcode) and c:IsCanBeSpecialSummoned(e,0,tp,true,true)
end
function c5675.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c5675.filter,tp,LOCATION_ONFIELD+LOCATION_HAND,0,1,nil,e,tp) and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c5675.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return false end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	local g=Duel.SelectMatchingCard(tp,c5675.filter,tp,LOCATION_ONFIELD+LOCATION_HAND,0,1,1,nil,e,tp)
	if g:GetCount()>0 then 
	    local tc=g:GetFirst()
        local tcode=c5675.list[tc:GetCode()]
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local tc1=Duel.SelectMatchingCard(tp,c5675.spfilter,tp,LOCATION_EXTRA,0,1,1,nil,e,tp,tcode)
		local sc=tc1:GetFirst()
		if sc then 
		    sc:SetMaterial(g)
			if tc:IsLocation(LOCATION_SZONE) and tc:IsFacedown() then Duel.ConfirmCards(1-tp,g) end
			Duel.SendtoGrave(tc,REASON_EFFECT)
			Duel.BreakEffect()
			Duel.SpecialSummon(sc,0,tp,tp,true,true,POS_FACEUP)
			sc:CompleteProcedure()
		end		
	end
end
