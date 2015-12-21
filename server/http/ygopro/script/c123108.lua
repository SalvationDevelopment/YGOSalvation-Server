--Legend of Heart
function c123108.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCost(c123108.cost)	
	e1:SetCondition(c123108.condition)
	e1:SetOperation(c123108.operation)
	c:RegisterEffect(e1)
end

function c123108.kfilter(c)
	return c:IsCode(12392) and c:IsAbleToRemoveAsCost()
end

function c123108.afilter(c)
	return c:IsCode(12393) and c:IsAbleToRemoveAsCost()
end

function c123108.bfilter(c)
	return c:IsCode(12394) and c:IsAbleToRemoveAsCost()
end

function c123108.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true
		and Duel.CheckLPCost(tp,1000)
		and Duel.CheckReleaseGroup(tp,nil,1,nil)
		and Duel.IsExistingMatchingCard(c123108.bfilter,tp,LOCATION_HAND+LOCATION_GRAVE,0,1,nil)	
		and Duel.IsExistingMatchingCard(c123108.afilter,tp,LOCATION_HAND+LOCATION_GRAVE,0,1,nil)
		and Duel.IsExistingMatchingCard(c123108.kfilter,tp,LOCATION_HAND+LOCATION_GRAVE,0,1,nil)end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g3=Duel.SelectMatchingCard(tp,c123108.bfilter,tp,LOCATION_HAND+LOCATION_GRAVE,0,1,1,nil)
	local g=Duel.SelectMatchingCard(tp,c123108.kfilter,tp,LOCATION_HAND+LOCATION_GRAVE,0,1,1,nil)
	local g1=Duel.SelectMatchingCard(tp,c123108.afilter,tp,LOCATION_HAND+LOCATION_GRAVE,0,1,1,nil)
	local g2=Duel.SelectReleaseGroup(tp,aux.TRUE,1,1,nil)	
	Duel.Remove(g,POS_FACEUP,REASON_COST)
	Duel.Remove(g1,POS_FACEUP,REASON_COST)
	Duel.Remove(g3,POS_FACEUP,REASON_COST)
	Duel.PayLPCost(tp,1000)
	Duel.Release(g2,REASON_COST)	
end

function c123108.condition(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler()
	 and Duel.GetLocationCount(tp,LOCATION_MZONE)>0
	 and Duel.IsExistingMatchingCard(c123108.filter,tp,LOCATION_DECK+LOCATION_GRAVE+LOCATION_HAND,0,1,nil,e,tp)
	 and Duel.IsExistingMatchingCard(c123108.zfilter,tp,LOCATION_DECK+LOCATION_GRAVE+LOCATION_HAND,0,1,nil,e,tp)
	 and Duel.IsExistingMatchingCard(c123108.yfilter,tp,LOCATION_DECK+LOCATION_GRAVE+LOCATION_HAND,0,1,nil,e,tp)
end

function c123108.filter(c,e,tp)
	return c:IsCode(12395) and c:IsCanBeSpecialSummoned(e,0,tp,true,true)
end
function c123108.zfilter(c,e,tp)
	return c:IsCode(12396) and c:IsCanBeSpecialSummoned(e,0,tp,true,true)
end
function c123108.yfilter(c,e,tp)
	return c:IsCode(12397) and c:IsCanBeSpecialSummoned(e,0,tp,true,true)
end
function c123108.operation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)==0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g1=Duel.SelectMatchingCard(tp,c123108.zfilter,tp,LOCATION_DECK+LOCATION_GRAVE+LOCATION_HAND,0,1,1,nil,e,tp)
	if g1:GetCount()>0 then Duel.SpecialSummonStep(g1:GetFirst(),0,tp,tp,true,true,POS_FACEUP) end
	local g2=Duel.SelectMatchingCard(tp,c123108.filter,tp,LOCATION_DECK+LOCATION_GRAVE+LOCATION_HAND,0,1,1,nil,e,tp)
	if g2:GetCount()>0 then Duel.SpecialSummonStep(g2:GetFirst(),0,tp,tp,true,true,POS_FACEUP) end
	local g3=Duel.SelectMatchingCard(tp,c123108.yfilter,tp,LOCATION_DECK+LOCATION_GRAVE+LOCATION_HAND,0,1,1,nil,e,tp)
	if g3:GetCount()>0 then Duel.SpecialSummonStep(g3:GetFirst(),0,tp,tp,true,true,POS_FACEUP) end
	Duel.SpecialSummonComplete()
end
