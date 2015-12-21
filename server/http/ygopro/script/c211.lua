--Tomato Paradise
function c211.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--token
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_SUMMON_SUCCESS)
	e2:SetCondition(c211.regcon)
	e2:SetOperation(c211.regop)
	c:RegisterEffect(e2)
	local e3=e2:Clone()
	e3:SetCode(EVENT_SPSUMMON_SUCCESS)
	c:RegisterEffect(e3)
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(211,0))
	e4:SetCategory(CATEGORY_SPECIAL_SUMMON+CATEGORY_TOKEN)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e4:SetRange(LOCATION_SZONE)
	e4:SetCode(211)
	e4:SetTarget(c211.sptg)
	e4:SetOperation(c211.spop)
	c:RegisterEffect(e4)
	--ATK
	local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_FIELD)
	e5:SetCode(EFFECT_UPDATE_ATTACK)
	e5:SetRange(LOCATION_SZONE)
	e5:SetTargetRange(LOCATION_MZONE,0)
	e5:SetTarget(c211.tg)
	e5:SetValue(c211.val)
	c:RegisterEffect(e5)
end



function c211.regcon(e,tp,eg,ep,ev,re,r,rp)
local c=eg:GetFirst()
if c:IsRace(RACE_PLANT) and c:IsPreviousLocation(LOCATION_HAND) then
	if c:GetSummonType()~=SUMMON_TYPE_SPECIAL+0x20 then
		local sf=0
		if eg:IsExists(Card.IsControler,1,nil,tp) then
			sf=sf+1
		end
		if eg:IsExists(Card.IsControler,1,nil,1-tp) then
			sf=sf+2
		end
		e:SetLabel(sf)
		return true
	else return false end
	end
end

function c211.regop(e,tp,eg,ep,ev,re,r,rp)
	Duel.RaiseEvent(eg,211,e,r,rp,ep,e:GetLabel())
end
function c211.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetTargetCard(eg)
	Duel.SetOperationInfo(0,CATEGORY_TOKEN,nil,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,0,0)
end
function c211.spop(e,tp,eg,ep,ev,re,r,rp)
	if bit.band(ev,0x2)~=0 and Duel.GetLocationCount(1-tp,LOCATION_MZONE)>0 and Duel.SelectYesNo(1-tp,aux.Stringid(15341821,0))
		and Duel.IsPlayerCanSpecialSummonMonster(tp,212,0,0x4011,0,0,1,RACE_PLANT,ATTRIBUTE_EARTH,POS_FACEUP,1-tp) then
		local token=Duel.CreateToken(tp,212)
		Duel.SpecialSummonStep(token,0x20,1-tp,1-tp,false,false,POS_FACEUP)
	end
	if bit.band(ev,0x1)~=0 and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and Duel.SelectYesNo(tp,aux.Stringid(15341821,0))
		and Duel.IsPlayerCanSpecialSummonMonster(1-tp,212,0,0x4011,0,0,1,RACE_PLANT,ATTRIBUTE_EARTH,POS_FACEUP) then
		local token=Duel.CreateToken(1-tp,212)
		Duel.SpecialSummonStep(token,0x20,tp,tp,false,false,POS_FACEUP)
	end
	Duel.SpecialSummonComplete()
end


function c211.tg(e,c)
	return c:IsRace(RACE_PLANT)
end
function c211.filter(c)
	return c:IsFaceup() and c:IsRace(RACE_PLANT)
end
function c211.val(e,c)
	return Duel.GetMatchingGroupCount(c211.filter,c:GetControler(),LOCATION_MZONE,0,nil)*200
end
