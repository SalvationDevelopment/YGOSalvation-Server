--No.64 古狸三太夫 Sandayu the vetanuki
--Nyanyanyanyanyanyanyanyanyanyanyanya
function c64.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,c64.xyzfilter,2,2)
	c:EnableReviveLimit()
	--token
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(64,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON+CATEGORY_TOKEN)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetCountLimit(1)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCost(c64.spcost)
	e1:SetTarget(c64.sptg)
	e1:SetOperation(c64.spop)
	c:RegisterEffect(e1)
	--indestructable
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e2:SetCondition(c64.indcon)
	e2:SetValue(1)
	c:RegisterEffect(e2)
	local e3=e2:Clone()
	e3:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	c:RegisterEffect(e3)
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e4:SetValue(c64.indes)
	c:RegisterEffect(e4)
	local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_SINGLE)
	e5:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e5:SetRange(LOCATION_MZONE)
	e5:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	e5:SetValue(c64.indval)
	c:RegisterEffect(e5)
end
function c64.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c64.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsPlayerCanSpecialSummonMonster(tp,9964,0,0x4011,-2,0,1,RACE_BEAST,ATTRIBUTE_EARTH) end
	Duel.SetOperationInfo(0,CATEGORY_TOKEN,nil,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,0,0)
end
function c64.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0
		or not Duel.IsPlayerCanSpecialSummonMonster(tp,9964,0,0x4011,-2,0,1,RACE_BEAST,ATTRIBUTE_EARTH) then return end
	local token=Duel.CreateToken(tp,9964)
	Duel.SpecialSummonStep(token,0,tp,tp,false,false,POS_FACEUP)
	local g,atk=Duel.GetMatchingGroup(Card.IsFaceup,tp,LOCATION_MZONE,LOCATION_MZONE,nil):GetMaxGroup(Card.GetAttack)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_SET_ATTACK)
	e1:SetValue(atk)
	e1:SetReset(RESET_EVENT+0x1fe0000)
	token:RegisterEffect(e1)
	Duel.SpecialSummonComplete()
end
function c64.ifilter(c)
	return c:IsFaceup() and c:IsRace(RACE_BEAST)
end
function c64.indcon(e)
	return Duel.IsExistingMatchingCard(c64.ifilter,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,e:GetHandler())
end

function c64.indes(e,c)
	return not c:IsSetCard(0x48)
end

function c64.indval(e,re)
	if not re then return false end
	local ty=re:GetActiveType()
	return not re:GetOwner():IsSetCard(0x48)
end

function c64.xyzfilter(c)
	return Duel.GetFlagEffect(c:GetControler(),64)==0 and c:IsRace(RACE_BEAST)
end
--Nyanyanyanyanyanyanyanyanyanyanyanya


