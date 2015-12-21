--Ultimaya Tzolk'in
function c13725000.initial_effect(c)
	c:EnableReviveLimit()
	--Cannot special summon
	local ef=Effect.CreateEffect(c)
	ef:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	ef:SetType(EFFECT_TYPE_SINGLE)
	ef:SetCode(EFFECT_SPSUMMON_CONDITION)
	ef:SetValue(aux.FALSE)
	c:RegisterEffect(ef)
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetRange(LOCATION_EXTRA)
	e1:SetCondition(c13725000.syncon)
	e1:SetOperation(c13725000.synop)
	c:RegisterEffect(e1)
	--DuelDragon
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(30757396,0))
	e2:SetCategory(CATEGORY_DAMAGE)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetCode(EVENT_SSET)
	e2:SetCountLimit(1)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCondition(c13725000.dueldragoncon2)
	e2:SetTarget(c13725000.dueldragontg2)
	e2:SetOperation(c13725000.dueldragonop2)
	c:RegisterEffect(e2)
	--cannot target
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EFFECT_CANNOT_BE_EFFECT_TARGET)
	e3:SetCondition(c13725000.atklm)
	e3:SetValue(c13725000.tgvalue)
	c:RegisterEffect(e3)
	--cannot be target
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCondition(c13725000.atklm)
	e3:SetValue(1)
	c:RegisterEffect(e3)
end
--~ Summon
function c13725000.mfilter(c)
	return c:IsFaceup()
end
function c13725000.synfilter1(c,g)
	return g:IsExists(c13725000.synfilter2,1,c,c:GetLevel()) and c:IsType(TYPE_TUNER) and c:GetLevel()>4
end
function c13725000.synfilter2(c,lv)
	return c:GetLevel()==lv  and not c:IsType(TYPE_TUNER)
end
function c13725000.syncon(e,c,og)
	if c==nil then return true end
	local tp=c:GetControler()
	local mg=Duel.GetMatchingGroup(c13725000.mfilter,tp,LOCATION_MZONE,0,nil)
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>-1
		and mg:IsExists(c13725000.synfilter1,1,nil,mg)
end
function c13725000.synop(e,tp,eg,ep,ev,re,r,rp,c,og)
	local mg=Duel.GetMatchingGroup(c13725000.mfilter,tp,LOCATION_MZONE,0,nil)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_XMATERIAL)
	local g1=mg:FilterSelect(tp,c13725000.synfilter1,1,1,nil,mg)
	local tc1=g1:GetFirst()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_XMATERIAL)
	local g2=mg:FilterSelect(tp,c13725000.synfilter2,1,1,tc1,tc1:GetLevel())
	local tc2=g2:GetFirst()
	g1:Merge(g2)
	c:SetMaterial(g1)
	Duel.SendtoGrave(g1,REASON_EFFECT)
end
--DuelDragon
function c13725000.dueldragoncon2(e,tp,eg,ep,ev,re,r,rp)
	return rp==tp
end
function c13725000.filter(c,e,tp)
	return c:IsType(TYPE_SYNCHRO) and c:IsCanBeSpecialSummoned(e,0,tp,false,false) and
	(c:GetLevel()==7 or c:GetLevel()==8 and c:IsRace(RACE_DRAGON)) or (c:IsCode(2403771) or c:IsCode(68084557))
end
function c13725000.dueldragontg2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c13725000.filter,tp,LOCATION_EXTRA,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c13725000.dueldragonop2(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c13725000.filter,tp,LOCATION_EXTRA,0,1,1,nil,e,tp)
	local tc=g:GetFirst()
	if tc and Duel.SpecialSummonStep(tc,0,tp,tp,false,false,POS_FACEUP) then
		Duel.SpecialSummonComplete()
	end
end
--cannot target
function c13725000.tgvalue(e,re,rp)
	return rp~=e:GetHandlerPlayer()
end
function c13725000.filter2(c)
	return c:IsFaceup() and c:IsType(TYPE_SYNCHRO)
end
function c13725000.atklm(e)
	local c=e:GetHandler()
	return Duel.IsExistingMatchingCard(c13725000.filter2,c:GetControler(),LOCATION_MZONE,0,1,c)
end
