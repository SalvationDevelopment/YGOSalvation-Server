--Hot Red Dragon Archfiend Belial
function c13753041.initial_effect(c)
	--synchro summon
	aux.AddSynchroProcedure2(c,nil,aux.NonTuner(c13753041.synfilter))
	c:EnableReviveLimit()
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetCountLimit(1,13753041)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCost(c13753041.cost)
	e1:SetTarget(c13753041.sptg1)
	e1:SetOperation(c13753041.spop1)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_BATTLE_DAMAGE)
	e2:SetCountLimit(1,13753141)
	e2:SetCondition(c13753041.setcon)
	e2:SetTarget(c13753041.settg)
	e2:SetOperation(c13753041.setop)
	c:RegisterEffect(e2)

end
function c13753041.synfilter(c)
	return c:GetRace()==RACE_DRAGON and c:GetAttribute()==ATTRIBUTE_DARK and c:IsType(TYPE_SYNCHRO)
end

function c13753041.setcon(e,tp,eg,ep,ev,re,r,rp)
	return ep~=tp
end
function c13753041.filter(c,e,tp)
	local lv=c:GetLevel()
	return c:IsType(TYPE_TUNER) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
	and Duel.IsExistingTarget(c13753041.filter2,tp,LOCATION_DECK,0,1,nil,e,tp,lv)
end
function c13753041.filter2(c,e,tp,lv)
	return  c:IsType(TYPE_TUNER) and c:IsCanBeSpecialSummoned(e,0,tp,false,false) and c:GetLevel()==lv
end
function c13753041.settg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>1
		and Duel.IsExistingMatchingCard(c13753041.filter,tp,LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,2,tp,LOCATION_DECK+LOCATION_GRAVE)
end
function c13753041.setop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<2 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c13753041.filter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	local tc=g:GetFirst()
	local lv=tc:GetLevel()
	if tc then
		Duel.SpecialSummonStep(tc,0,tp,tp,false,false,POS_FACEUP_DEFENCE)
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	g=Duel.SelectMatchingCard(tp,c13753041.filter2,tp,LOCATION_DECK,0,1,1,nil,e,tp,lv)
	tc=g:GetFirst()
	if tc then
		Duel.SpecialSummonStep(tc,0,tp,tp,false,false,POS_FACEUP_DEFENCE)
	end
	Duel.SpecialSummonComplete()
end


function c13753041.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,nil,1,nil) end
	local g=Duel.SelectReleaseGroup(tp,aux.TRUE,1,1,nil)
	Duel.Release(g,REASON_COST)
end
function c13753041.filter1(c,e,tp)
	return (c:IsCode(39765958) or  c:IsCode(70902743) or  c:IsCode(13753040) or c:IsCode(13753041))
		and c:IsCanBeSpecialSummoned(e,0,tp,false,false) and not c:IsHasEffect(EFFECT_NECRO_VALLEY)
end
function c13753041.sptg1(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>-1
		and Duel.IsExistingMatchingCard(c13753041.filter1,tp,LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_GRAVE)
end
function c13753041.spop1(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c13753041.filter1,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
	end
end
