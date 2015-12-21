--Toon Mask
function c13720102.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCondition(c13720102.condition)
	e1:SetTarget(c13720102.target)
	e1:SetOperation(c13720102.operation)
	c:RegisterEffect(e1)
end
function c13720102.cfilter(c)
	return c:IsFaceup() and c:IsCode(15259703)
end
function c13720102.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c13720102.cfilter,tp,LOCATION_ONFIELD,0,1,nil)
end

function c13720102.filter(c,e,tp)
	local lv=c:GetLevel()
	if c:IsType(TYPE_XYZ) then lv=c:GetRank() end
	return c:IsFaceup() and lv>0 and Duel.IsExistingMatchingCard(c13720102.spfilter,tp,LOCATION_HAND+LOCATION_DECK,0,1,nil,e,tp,lv)
end
function c13720102.spfilter(c,e,tp,lv)
	return c:GetLevel()<=lv and c:IsType(TYPE_TOON) and c:IsCanBeSpecialSummoned(e,0,tp,true,false)
end
function c13720102.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return false end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c13720102.filter,tp,0,LOCATION_MZONE,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_OPPO)
	Duel.SelectTarget(tp,c13720102.filter,tp,0,LOCATION_MZONE,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_HAND+LOCATION_DECK)
end
function c13720102.operation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	local tc=Duel.GetFirstTarget()
	local lv=tc:GetLevel()
	if tc:IsFaceup() and tc:IsRelateToEffect(e) then
	if tc:IsType(TYPE_XYZ) then lv=tc:GetRank() end
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local g=Duel.SelectMatchingCard(tp,c13720102.spfilter,tp,LOCATION_HAND+LOCATION_DECK,0,1,1,nil,e,tp,lv)
		if g:GetCount()>0 then
			Duel.SpecialSummon(g,0,tp,tp,true,false,POS_FACEUP)
		end
	end
end
