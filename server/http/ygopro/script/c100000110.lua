--眠れる巨人ズシン 
function c100000110.initial_effect(c)
	c:EnableReviveLimit()
	--cannot special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(aux.FALSE)
	c:RegisterEffect(e1)
	--spsummon proc
	local e2=Effect.CreateEffect(c)	
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE+EFFECT_FLAG_CANNOT_DISABLE)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_PHASE+PHASE_END)
	e2:SetCountLimit(1)
	e2:SetRange(LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE+LOCATION_REMOVED+LOCATION_ONFIELD)
	e2:SetTargetRange(LOCATION_MZONE,0)
	e2:SetOperation(c100000110.spop)
	c:RegisterEffect(e2)
	--special summon
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD)
	e4:SetCode(EFFECT_SPSUMMON_PROC)
	e4:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e4:SetRange(LOCATION_HAND)
	e4:SetCondition(c100000110.spcon3)
	e4:SetOperation(c100000110.spop3)
	c:RegisterEffect(e4)
	--negate
	local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e5:SetCode(EVENT_ATTACK_ANNOUNCE)
	e5:SetOperation(c100000110.negop1)
	c:RegisterEffect(e5)
	local e6=Effect.CreateEffect(c)
	e6:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e6:SetCode(EVENT_BE_BATTLE_TARGET)
	e6:SetOperation(c100000110.negop2)
	c:RegisterEffect(e6)	
	--unaffectable
	local e7=Effect.CreateEffect(c)
	e7:SetType(EFFECT_TYPE_SINGLE)
	e7:SetProperty(EFFECT_FLAG_SINGLE_RANGE+EFFECT_FLAG_CANNOT_DISABLE)
	e7:SetRange(LOCATION_MZONE)
	e7:SetCode(EFFECT_IMMUNE_EFFECT)
	e7:SetValue(c100000110.efilter)
	--e7:SetValue(0)
	c:RegisterEffect(e7)
	--atk
	--atkup
	local e8=Effect.CreateEffect(c)
	e8:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e8:SetCode(EVENT_DAMAGE_CALCULATING)
	e8:SetCondition(c100000110.atkcon)
	e8:SetOperation(c100000110.atkop)
	c:RegisterEffect(e8)
	
end
function c100000110.spfilter1(c)
	return c:IsFaceup() and c:GetLevel()==1 and c:IsType(TYPE_NORMAL)
end
function c100000110.spop(e,tp,c)
	local c=e:GetHandler()
	if c:GetControler()~=Duel.GetTurnPlayer() then return end
	local g=Duel.GetMatchingGroup(c100000110.spfilter1,c:GetControler(),LOCATION_MZONE,0,nil)
	local rc=g:GetFirst()
	while rc do
		if rc:GetFlagEffect(100000110)==0 then 
			local e1=Effect.CreateEffect(rc)	
			e1:SetProperty(EFFECT_FLAG_UNCOPYABLE+EFFECT_FLAG_CANNOT_DISABLE)
			e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
			e1:SetCode(EVENT_PHASE_START+PHASE_STANDBY)
			e1:SetCountLimit(1)
			e1:SetRange(LOCATION_MZONE)
			e1:SetTargetRange(LOCATION_MZONE,0)
			e1:SetCondition(c100000110.spcon1)
			e1:SetLabel(0)
			e1:SetOperation(c100000110.spop2)
			rc:RegisterEffect(e1)			
			rc:RegisterFlagEffect(100000110,RESET_EVENT+0x1fe0000,0,1) 	
		end
		rc=g:GetNext()
	end
end
function c100000110.spcon1(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()==tp
end
function c100000110.spop2(e,tp,c)
	local c=e:GetHandler()
	if c:GetControler()~=Duel.GetTurnPlayer() then return end
	local ct=e:GetLabel()
	if c:GetFlagEffect(100000110)~=0 and ct==8 then 
		c:RegisterFlagEffect(100000111,RESET_EVENT+0x1fe0000,0,1) 	
	else	
		e:SetLabel(ct+1)
	end
end
function c100000110.filter(c)
	return  c:IsFaceup() and c:GetLevel()==1 and c:IsType(TYPE_NORMAL) and c:GetFlagEffect(100000111)~=0
end
function c100000110.spcon3(e,c)
	local c=e:GetHandler()
	if c==nil then return true end
	return Duel.GetLocationCount(c:GetControler(),LOCATION_MZONE)>-1
		and Duel.CheckReleaseGroup(c:GetControler(),c100000110.filter,1,nil)
end
function c100000110.spop3(e,tp,eg,ep,ev,re,r,rp,c)
	local g=Duel.SelectReleaseGroup(tp,c100000110.filter,1,1,nil)
	Duel.Release(g,REASON_COST)
end
function c100000110.negop1(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local d=Duel.GetAttackTarget()
	if d then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_DISABLE)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_BATTLE)
		d:RegisterEffect(e1)
		local e2=Effect.CreateEffect(e:GetHandler())
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_DISABLE_EFFECT)
		e2:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_BATTLE)
		d:RegisterEffect(e2)
	end
end
function c100000110.negop2(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local a=Duel.GetAttacker()
	if a then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_DISABLE)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_BATTLE)
		a:RegisterEffect(e1)
		local e2=Effect.CreateEffect(e:GetHandler())
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_DISABLE_EFFECT)
		e2:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_BATTLE)
		a:RegisterEffect(e2)
	end
end
function c100000110.atkcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetBattleTarget()~=nil
end
function c100000110.atkop(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetHandler():GetBattleTarget()
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_UPDATE_ATTACK)
	e1:SetReset(RESET_PHASE+RESET_DAMAGE_CAL)
	e1:SetValue(tc:GetBaseAttack()+1000)
	e:GetHandler():RegisterEffect(e1)
	local e2=Effect.CreateEffect(e:GetHandler())
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_UPDATE_DEFENCE)
	e2:SetReset(RESET_PHASE+RESET_DAMAGE_CAL)
	e2:SetValue(tc:GetBaseAttack()+1000)
	e:GetHandler():RegisterEffect(e2)
end

function c100000110.efilter(e,re)
	return e:GetHandler()~=re:GetOwner()
end