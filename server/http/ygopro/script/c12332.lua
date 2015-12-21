--Ancient Gate
function c12332.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c12332.condition)
	e1:SetTarget(c12332.target)
	e1:SetOperation(c12332.activate)
	c:RegisterEffect(e1)
end
function c12332.cfilter(c)
	return c:IsFaceup() and c:IsCode(12329)
end
function c12332.dfilter(c)
	return c:IsFaceup() and c:IsCode(12331)
end
function c12332.efilter(c)
	return c:IsFaceup() and c:IsCode(12330)
end
function c12332.ffilter(c)
	return c:IsFaceup() and c:IsCode(12333)
end
function c12332.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c12332.cfilter,tp,LOCATION_SZONE,0,1,nil)
		and Duel.IsExistingMatchingCard(c12332.dfilter,tp,LOCATION_SZONE,0,1,nil)
		and Duel.IsExistingMatchingCard(c12332.efilter,tp,LOCATION_SZONE,0,1,nil)
		and Duel.IsExistingMatchingCard(c12332.ffilter,tp,LOCATION_MZONE,0,1,nil)
end
function c12332.filter(c,e,tp)
	return c:IsCode(12335) and c:IsCanBeSpecialSummoned(e,0,tp,true,true)
end
function c12332.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c12332.filter,tp,LOCATION_DECK+LOCATION_HAND+LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,tp,LOCATION_DECK+LOCATION_HAND+LOCATION_GRAVE)
end
function c12332.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c12332.filter,tp,LOCATION_DECK+LOCATION_HAND+LOCATION_GRAVE,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		Duel.SpecialSummon(g,0,tp,tp,true,true,POS_FACEUP)
	end
end

