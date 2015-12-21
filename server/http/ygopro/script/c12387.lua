--Illusion Gate
function c12387.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c12387.condition)
	e1:SetTarget(c12387.target)
	e1:SetOperation(c12387.activate)
	c:RegisterEffect(e1)
end
function c12387.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsDestructable,tp,0,LOCATION_MZONE,1,nil) end
end
function c12387.activate(e,tp,eg,ep,ev,re,r,rp)
	local sg=Duel.GetMatchingGroup(Card.IsDestructable,tp,0,LOCATION_MZONE,nil)
	local sg=Duel.GetMatchingGroup(Card.IsDestructable,tp,0,LOCATION_MZONE,nil)
	Duel.Destroy(sg,REASON_EFFECT)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and c12387.sfilter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c12387.sfilter,tp,0,LOCATION_GRAVE,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c12387.sfilter,tp,0,LOCATION_GRAVE,1,1,nil,e,tp)
	local tc=Duel.GetFirstTarget()
		tc=Duel.SpecialSummon(tc,0,tp,tp,true,false,POS_FACEUP)
end
function c12387.filter(c)
	return c:IsType(TYPE_MONSTER) and not c:IsRace(RACE_ZOMBIE)
end
function c12387.cfilter(c)
	return c:IsType(TYPE_MONSTER) and c:IsRace(RACE_ZOMBIE)
end
function c12387.condition(e,tp,eg,ep,ev,re,r,rp)
	return tp==Duel.GetTurnPlayer() and not Duel.IsExistingMatchingCard(c12387.filter,tp,LOCATION_GRAVE,0,1,nil)
		and Duel.IsExistingMatchingCard(c12387.cfilter,tp,LOCATION_GRAVE,0,1,nil)
end
function c12387.sfilter(c,e,tp)
	return c:IsType(TYPE_MONSTER) and c:IsCanBeSpecialSummoned(e,0,tp,true,false)
end
