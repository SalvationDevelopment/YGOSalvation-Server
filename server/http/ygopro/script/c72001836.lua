--Tuner's High
--By: HelixReactor
function c72001836.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCost(c72001836.cost)
	e1:SetTarget(c72001836.target)
	e1:SetOperation(c72001836.activate)
	c:RegisterEffect(e1)
end
function c72001836.filter(c,e,tp,lv,rc,att)
	return c:IsType(TYPE_TUNER) and c:GetLevel()==lv+1 and c:IsRace(rc) and c:IsAttribute(att) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c72001836.cfilter(c,e,tp)
	return c:IsType(TYPE_MONSTER) and c:IsDiscardable()
		and Duel.IsExistingMatchingCard(c72001836.filter,tp,LOCATION_DECK,0,1,nil,e,tp,c:GetLevel(),c:GetRace(),c:GetAttribute())
end
function c72001836.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c72001836.cfilter,tp,LOCATION_HAND,0,1,nil,e,tp) end
	local tg=Duel.SelectMatchingCard(tp,c72001836.cfilter,tp,LOCATION_HAND,0,1,1,nil,e,tp)
	e:SetLabelObject(tg:GetFirst())
	Duel.SendtoGrave(tg,REASON_DISCARD+REASON_COST)
end
function c72001836.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE,0)>0
		and Duel.IsExistingMatchingCard(c72001836.cfilter,tp,LOCATION_HAND,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_DECK)
end
function c72001836.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local tg=e:GetLabelObject()
	local g=Duel.SelectMatchingCard(tp,c72001836.filter,tp,LOCATION_DECK,0,1,1,nil,e,tp,tg:GetLevel(),tg:GetRace(),tg:GetAttribute())
	if g:GetCount()>0 then
		Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
	end
end