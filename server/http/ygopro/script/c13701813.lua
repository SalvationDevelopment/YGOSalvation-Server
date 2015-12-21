--Exodia the Summoned Lord
function c13701813.initial_effect(c)
	c:EnableReviveLimit()
	--cannot special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	c:RegisterEffect(e1)
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_HAND)
	e2:SetCondition(c13701813.spcon1)
	e2:SetOperation(c13701813.spop1)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_IMMUNE_EFFECT)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetValue(c13701813.efilter)
	c:RegisterEffect(e3)
	--atkup
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCode(EFFECT_UPDATE_ATTACK)
	e4:SetValue(c13701813.atkval)
	c:RegisterEffect(e4)
	local e5=Effect.CreateEffect(c)
	e5:SetDescription(aux.Stringid(70902743,1))
	e5:SetCategory(CATEGORY_DESTROY)
	e5:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e5:SetRange(LOCATION_MZONE)
	e5:SetCountLimit(1)
	e5:SetCode(EVENT_PHASE+PHASE_END)
	e5:SetTarget(c13701813.target2)
	e5:SetOperation(c13701813.operation2)
	c:RegisterEffect(e5)
	local e6=Effect.CreateEffect(c)
	e6:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e6:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e6:SetCode(EVENT_BATTLE_DESTROYED)
	e6:SetTarget(c13701813.sptg)
	e6:SetOperation(c13701813.spop)
	c:RegisterEffect(e6)
end
function c13701813.exodfilter(c)
	return c:IsCode(8124921) or c:IsCode(44519536) or c:IsCode(70903634) or c:IsCode(7902349) or c:IsCode(33396948)
end
function c13701813.spcon1(e,c)
	if c==nil then return true end
	return Duel.GetLocationCount(c:GetControler(),LOCATION_MZONE)>-1
		and Duel.CheckReleaseGroup(c:GetControler(),c13701813.exodfilter,1,nil)
end
function c13701813.spop1(e,tp,eg,ep,ev,re,r,rp,c)
	if c==nil then return true end
	local g=Duel.SelectReleaseGroup(c:GetControler(),c13701813.exodfilter,1,1,nil)
	Duel.Release(g,REASON_COST)
end

function c13701813.efilter(e,te)
	return te:GetOwner()~=e:GetOwner()
end
function c13701813.atkval(e,c)
	return Duel.GetMatchingGroupCount(c13701813.exodfilter,c:GetControler(),LOCATION_GRAVE,0,nil)*1000
end

function c13701813.target2(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:GetControler()==tp and chkc:GetLocation()==LOCATION_GRAVE and c13701813.c13701813(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13701813.exodfilter,tp,LOCATION_GRAVE,0,1,nil) and tp==Duel.GetTurnPlayer() end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectTarget(tp,c13701813.exodfilter,tp,LOCATION_GRAVE,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,1,0,0)
end
function c13701813.operation2(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,tc)
	end
end

function c13701813.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13701813.exodfilter,tp,LOCATION_HAND,0,1,nil) end
end
function c13701813.spop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_CONFIRM)
	local cg=Duel.SelectMatchingCard(tp,c13701813.exodfilter,tp,LOCATION_HAND,0,1,99,nil)
	Duel.ConfirmCards(1-tp,cg)
	Duel.ShuffleHand(tp)
	local ct=cg:GetCount()
	Duel.Draw(tp,ct,REASON_EFFECT)
end
