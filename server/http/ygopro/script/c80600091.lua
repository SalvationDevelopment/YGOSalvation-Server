--ラインモンスターＫホース
function c80600091.initial_effect(c)
	--spsummon
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetTarget(c80600091.sumtg)
	e1:SetOperation(c80600091.sumop)
	c:RegisterEffect(e1)
end
function c80600091.filter(c)
	return c:IsType(TYPE_SPELL+TYPE_TRAP) and c:IsFacedown()
end
function c80600091.sumtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80600091.filter,tp,0,LOCATION_SZONE,1,nil) end	
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c80600091.filter,tp,0,LOCATION_SZONE,1,1,nil)
	Duel.SetTargetCard(g)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,nil,1,tp,LOCATION_SZONE)
end
function c80600091.sumop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.ConfirmCards(tp,tc)
		if tc:IsType(TYPE_TRAP) then 
			if Duel.Destroy(tc,REASON_EFFECT) then
				if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 
					and Duel.IsExistingMatchingCard(c80600091.mfilter,tp,LOCATION_HAND,0,1,nil,e) then return end
				if Duel.SelectYesNo(tp,aux.Stringid(80600091,0)) then
					local c=Duel.SelectMatchingCard(tp,c80600091.mfilter,tp,LOCATION_HAND,0,1,1,nil,e)
					Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP_DEFENCE)
				end
			end
		end
	end
end
function c80600091.mfilter(c,e)
	return c:GetLevel()==3 and c:IsAttribute(ATTRIBUTE_EARTH) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end