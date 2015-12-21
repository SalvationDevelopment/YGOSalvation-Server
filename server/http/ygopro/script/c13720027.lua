--Mimicat
function c13720027.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCountLimit(1,13720027)
	e1:SetCondition(c13720027.condition)
	e1:SetTarget(c13720027.target)
	e1:SetOperation(c13720027.operation)
	c:RegisterEffect(e1)
end
function c13720027.cfilter(c)
	return c:IsFaceup() and c:IsCode(15259703)
end
function c13720027.cfilter2(c)
	return c:IsFaceup() and c:IsType(TYPE_TOON)
end
function c13720027.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c13720027.cfilter,tp,LOCATION_ONFIELD,0,1,nil)
	and Duel.IsExistingMatchingCard(c13720027.cfilter2,tp,LOCATION_ONFIELD,0,1,nil) and
	(Duel.GetLocationCount(tp,LOCATION_MZONE)>0 or Duel.GetLocationCount(tp,LOCATION_SZONE)>0
		and Duel.IsExistingTarget(c13720027.filter,tp,0,LOCATION_GRAVE,1,nil,e,tp))
end
function c13720027.filter(c,e,tp)
	return (c:IsType(TYPE_MONSTER) and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and c:IsCanBeSpecialSummoned(e,0,tp,false,false))
		or	(c:IsType(TYPE_SPELL+TYPE_TRAP) and Duel.GetLocationCount(tp,LOCATION_SZONE)>0 and c:IsSSetable()) 
end
function c13720027.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and c13720027.filter(chkc,e,tp) end
	if chk==0 then return Duel.IsExistingTarget(c13720027.filter,tp,0,LOCATION_GRAVE,1,nil,e,tp) and 
	Duel.GetLocationCount(tp,LOCATION_MZONE)>0 or Duel.GetLocationCount(tp,LOCATION_SZONE)>0 end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c13720027.filter,tp,0,LOCATION_GRAVE,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c13720027.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsType(TYPE_MONSTER) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
		else
		Duel.SSet(tp,tc)
	end
end
