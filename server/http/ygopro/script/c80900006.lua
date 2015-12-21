--冥界龍 ドラゴネクロ
function c80900006.initial_effect(c)
	c:SetUniqueOnField(1,0,80900006)
	--fusion material
	c:EnableReviveLimit()
	aux.AddFusionProcFunRep(c,aux.FilterBoolFunction(Card.IsRace,RACE_ZOMBIE),2,true)
	--spsummon condition
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(c80900006.splimit)
	c:RegisterEffect(e1)
	--battle
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EVENT_DAMAGE_CALCULATING)
	e2:SetCondition(c80900006.indescon)
	e2:SetOperation(c80900006.indesop)
	c:RegisterEffect(e2)
	--atk change
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80900006,0))
	e3:SetCategory(CATEGORY_ATKCHANGE+CATEGORY_SPECIAL_SUMMON+CATEGORY_TOKEN)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_DAMAGE_STEP_END)
	e3:SetCondition(c80900006.indescon)
	e3:SetOperation(c80900006.operation)
	c:RegisterEffect(e3)
end
function c80900006.splimit(e,se,sp,st)
	return not e:GetHandler():IsLocation(LOCATION_EXTRA) or bit.band(st,SUMMON_TYPE_FUSION)==SUMMON_TYPE_FUSION
end
function c80900006.indescon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetBattleTarget()~=nil
end
function c80900006.indesop(e,tp,eg,ep,ev,re,r,rp)
	local bc=e:GetHandler():GetBattleTarget()
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e1:SetValue(1)
	e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_DAMAGE_CAL)
	bc:RegisterEffect(e1,true)
end
function c80900006.operation(e,tp,eg,ep,ev,re,r,rp)
	local d=e:GetHandler():GetBattleTarget()
	if not Duel.IsPlayerCanSpecialSummonMonster(tp,80900007,0,0x4011,0,0,1,RACE_ZOMBIE,ATTRIBUTE_DARK) then return end
	local token=Duel.CreateToken(tp,80900007)
	Duel.SpecialSummon(token,0,tp,tp,false,false,POS_FACEUP)
	if d and d:IsRelateToBattle() then
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_UPDATE_ATTACK)
	e1:SetValue(d:GetBaseAttack())
	token:RegisterEffect(e1)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CHANGE_LEVEL)
	e1:SetValue(d:GetOriginalLevel())
	token:RegisterEffect(e1)
	local e2=Effect.CreateEffect(e:GetHandler())
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_SET_ATTACK_FINAL)
	e2:SetValue(0)
	e2:SetReset(RESET_EVENT+0x1fe0000)
	d:RegisterEffect(e2)
	end
end