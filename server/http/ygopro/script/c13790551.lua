--The Claw of Hermos
function c13790551.initial_effect(c)
    --Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,13790551+EFFECT_COUNT_CODE_OATH)
	e1:SetTarget(c13790551.target)
	e1:SetOperation(c13790551.activate)
	c:RegisterEffect(e1)
end
c13790551.list={[RACE_DRAGON]=13790575}
function c13790551.filter(c,e,tp)
    local race=c:GetRace()
	local tcode=c13790551.list[race]
	return tcode and Duel.IsExistingMatchingCard(c13790551.spfilter,tp,LOCATION_EXTRA,0,1,nil,e,tp,tcode)
end
function c13790551.spfilter(c,e,tp,tcode)
    return c:IsCode(tcode) and c:IsCanBeSpecialSummoned(e,0,tp,true,true)
end
function c13790551.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return  (Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and Duel.IsExistingMatchingCard(c13790551.filter,tp,LOCATION_HAND+LOCATION_ONFIELD,0,1,nil,e,tp)) or 
	(Duel.GetLocationCount(tp,LOCATION_MZONE)>-1 and Duel.IsExistingMatchingCard(c13790551.filter,tp,LOCATION_ONFIELD,0,1,nil,e,tp)) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c13790551.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then 
	local g=Duel.SelectMatchingCard(tp,c13790551.filter,tp,LOCATION_ONFIELD,0,1,1,nil,e,tp)
	if g:GetCount()>0 then 
	    local tc=g:GetFirst()
        local tcode=c13790551.list[tc:GetRace()]
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local tc1=Duel.SelectMatchingCard(tp,c13790551.spfilter,tp,LOCATION_EXTRA,0,1,1,nil,e,tp,tcode)
		local sc=tc1:GetFirst()
		if sc then 
		    sc:SetMaterial(g)
			if tc:IsLocation(LOCATION_MZONE) and tc:IsFacedown() then Duel.ConfirmCards(1-tp,g) end
			Duel.SendtoGrave(tc,REASON_EFFECT)
			Duel.BreakEffect()
			Duel.SpecialSummon(sc,0,tp,tp,true,true,POS_FACEUP)
			sc:CompleteProcedure()
			end
		end		
	
	else
	local g=Duel.SelectMatchingCard(tp,c13790551.filter,tp,LOCATION_ONFIELD+LOCATION_HAND,0,1,1,nil,e,tp)
	if g:GetCount()>0 then 
	    local tc=g:GetFirst()
        local tcode=c13790551.list[tc:GetRace()]
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local tc1=Duel.SelectMatchingCard(tp,c13790551.spfilter,tp,LOCATION_EXTRA,0,1,1,nil,e,tp,tcode)
		local sc=tc1:GetFirst()
		if sc then 
		    sc:SetMaterial(g)
			if tc:IsLocation(LOCATION_MZONE) and tc:IsFacedown() then Duel.ConfirmCards(1-tp,g) end
			Duel.SendtoGrave(tc,REASON_EFFECT)
			Duel.BreakEffect()
			Duel.SpecialSummon(sc,0,tp,tp,true,true,POS_FACEUP)
			sc:CompleteProcedure()
			end
		end		
	end
end
