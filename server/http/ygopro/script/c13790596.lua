--Mimicat
function c13790596.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCountLimit(1,13790596)
	e1:SetCondition(c13790596.condition)
	e1:SetTarget(c13790596.target)
	e1:SetOperation(c13790596.operation)
	c:RegisterEffect(e1)
end
function c13790596.cfilter(c)
	return c:IsFaceup() and c:IsCode(15259703)
end
function c13790596.cfilter2(c)
	return c:IsFaceup() and c:IsType(TYPE_TOON)
end
function c13790596.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c13790596.cfilter,tp,LOCATION_ONFIELD,0,1,nil)
	and Duel.IsExistingMatchingCard(c13790596.cfilter2,tp,LOCATION_ONFIELD,0,1,nil)
end
function c13790596.filter(c,e,tp)
	return (c:IsType(TYPE_MONSTER) and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and c:IsCanBeSpecialSummoned(e,0,tp,false,false))
		or	(c:IsType(TYPE_SPELL+TYPE_TRAP) and Duel.GetLocationCount(tp,LOCATION_SZONE)>0 and c:IsSSetable())
end
function c13790596.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and c13790596.filter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0 or Duel.GetLocationCount(tp,LOCATION_SZONE)>0
		and Duel.IsExistingTarget(c13790596.filter,tp,0,LOCATION_GRAVE,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c13790596.filter,tp,0,LOCATION_GRAVE,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c13790596.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsType(TYPE_MONSTER) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
		else
		Duel.SSet(tp,tc)
	end
end
