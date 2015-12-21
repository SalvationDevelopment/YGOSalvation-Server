--マリスボラス・フォーク
function c80600004.initial_effect(c)
	--spsummon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(53797637,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_HAND)
	e1:SetCost(c80600004.spcost)
	e1:SetOperation(c80600004.spop)
	c:RegisterEffect(e1)
end
function c80600004.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80600004.spfilter,tp,LOCATION_HAND,0,1,e:GetHandler()) end
	local g=Duel.SelectMatchingCard(tp,c80600004.spfilter,tp,LOCATION_HAND,0,1,1,e:GetHandler())
	Duel.SendtoGrave(g,REASON_COST)
end
function c80600004.spfilter(c)
	return c:IsRace(RACE_FIEND) and c:IsAbleToGraveAsCost()
end
function c80600004.spop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) then
		Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)
	end
end