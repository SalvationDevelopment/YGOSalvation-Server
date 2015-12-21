--RUM－七皇の剣 THE SEVENTH ONE
function c999.initial_effect(c)
	--Activate
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_ACTIVATE)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetTarget(c999.target)
	e2:SetOperation(c999.activate)
	c:RegisterEffect(e2)
end


function c999.filter1(c,e,tp)
	local no=c.xyz_number
	return no and no>=101 and no<=107 and c:IsSetCard(0x48) and not c:IsSetCard(0x1048)
		and c:IsCanBeSpecialSummoned(e,0,tp,false,false) and not c:IsHasEffect(EFFECT_NECRO_VALLEY)
		and Duel.IsExistingMatchingCard(c999.filter2,tp,LOCATION_EXTRA,0,1,nil,e,tp,no)
end
function c999.filter2(c,e,tp,no)
	return c.xyz_number==no and c:IsSetCard(0x1048) and c:IsCanBeSpecialSummoned(e,SUMMON_TYPE_XYZ,tp,false,false)
end
function c999.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return (not Duel.IsPlayerAffectedByEffect(tp,23516703) or c23516703[tp]==0)
		and Duel.GetFlagEffect(tp,999)==0 and Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c999.filter1,tp,LOCATION_GRAVE+LOCATION_EXTRA,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_GRAVE+LOCATION_EXTRA)
	Duel.RegisterFlagEffect(tp,999,0,EFFECT_FLAG_OATH,0)
end
function c999.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g1=Duel.SelectMatchingCard(tp,c999.filter1,tp,LOCATION_GRAVE+LOCATION_EXTRA,0,1,1,nil,e,tp)
	local tc1=g1:GetFirst()
	if tc1 and Duel.SpecialSummon(tc1,0,tp,tp,false,false,POS_FACEUP)~=0 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local g2=Duel.SelectMatchingCard(tp,c999.filter2,tp,LOCATION_EXTRA,0,1,1,nil,e,tp,tc1.xyz_number)
		local tc2=g2:GetFirst()
		if tc2 then
			Duel.Overlay(tc2,g1)
			Duel.SpecialSummon(tc2,SUMMON_TYPE_XYZ,tp,tp,false,false,POS_FACEUP)
			tc2:CompleteProcedure()
		end
	end
end
