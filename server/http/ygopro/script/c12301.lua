--Spirit Illusion
function c12301.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_EQUIP)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c12301.target)
	e1:SetOperation(c12301.operation)
	c:RegisterEffect(e1)
	--Equip limit
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_EQUIP_LIMIT)
	e3:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e3:SetValue(1)
	c:RegisterEffect(e3)	
end
function c12301.filter(c,e,tp)
	return c:IsFaceup()
		and Duel.IsPlayerCanSpecialSummonMonster(tp,12302,0,0x4011,c:GetAttack(),c:GetDefence(),c:GetLevel(),c:GetRace(),c:GetAttribute()) and c:IsLevelAbove(1)
end
function c12301.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE,LOCATION_MZONE) and c12301.filter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c12301.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil,e,tp) end
	local g=Duel.SelectTarget(tp,c12301.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_TOKEN,nil,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,0,0)
end
function c12301.operation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	local tc=Duel.GetFirstTarget()
	if tc:IsFacedown() or not tc:IsRelateToEffect(e) then return end
	if not Duel.IsPlayerCanSpecialSummonMonster(tp,12302,0,0x4011,tc:GetAttack(),tc:GetDefence(),tc:GetLevel(),tc:GetRace(),tc:GetAttribute()) then return end
	local token=Duel.CreateToken(tp,12302)
	Duel.SpecialSummonStep(token,0,tp,tp,false,false,POS_FACEUP)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_SET_ATTACK)
	e1:SetValue(tc:GetAttack())
	e1:SetReset(RESET_EVENT+0x1fe0000)
	token:RegisterEffect(e1)
	local e2=e1:Clone()
	e2:SetCode(EFFECT_SET_DEFENCE)
	e2:SetValue(tc:GetDefence())
	token:RegisterEffect(e2)
	local e3=e1:Clone()
	e3:SetCode(EFFECT_CHANGE_LEVEL)
	e3:SetValue(tc:GetLevel())
	token:RegisterEffect(e3)
	local e4=e1:Clone()
	e4:SetCode(EFFECT_CHANGE_RACE)
	e4:SetValue(tc:GetRace())
	token:RegisterEffect(e4)
	local e5=e1:Clone()
	e5:SetCode(EFFECT_CHANGE_ATTRIBUTE)
	e5:SetValue(tc:GetAttribute())
	token:RegisterEffect(e5)
	local e6=e1:Clone()
	e6:SetType(EFFECT_TYPE_SINGLE)
	e6:SetCode(EFFECT_SELF_DESTROY)
	e6:SetCondition(c12301.descon)
	token:RegisterEffect(e6)	
	Duel.SpecialSummonComplete()
	if e:GetHandler():IsRelateToEffect(e) and tc:IsRelateToEffect(e) and tc:IsFaceup() then
		Duel.Equip(tp,e:GetHandler(),tc)
	end	
end

function c12301.desfilter(c)
	return c:IsFaceup() and c:IsCode(12301)
end

function c12301.descon(e)
	local c=e:GetHandler()
	return not Duel.IsExistingMatchingCard(c12301.desfilter,c:GetControler(),LOCATION_SZONE,0,1,c)
end
