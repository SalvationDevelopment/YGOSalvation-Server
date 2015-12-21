--Chain Resonator
function c13753018.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DRAW)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetTarget(c13753018.target)
	e1:SetOperation(c13753018.activate)
	c:RegisterEffect(e1)

end
function c13753018.cfilter(c,e,tp)
	return c:IsType(TYPE_SYNCHRO)
end
function c13753018.filter(c,e,tp)
	return c:IsSetCard(0x57) and c:GetCode()~=13753018 and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c13753018.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and Duel.IsExistingMatchingCard(c13753018.filter,tp,LOCATION_DECK,0,1,nil,e,tp) 
	and Duel.IsExistingMatchingCard(c13753018.cfilter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_DECK)
end
function c13753018.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c13753018.filter,tp,LOCATION_DECK,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
	end
end
