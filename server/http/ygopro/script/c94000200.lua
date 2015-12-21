--Barrier Bubble
function c94000200.initial_effect(c)
    --Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--indestructable
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(94000200)
	e2:SetRange(LOCATION_SZONE)
	e2:SetTarget(c94000200.indestg)
	e2:SetTargetRange(LOCATION_MZONE,0)
	c:RegisterEffect(e2)
	--avoid battle damage
	local e3=Effect.CreateEffect(c)
	e3:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e3:SetCode(EVENT_PRE_BATTLE_DAMAGE)
	e3:SetRange(LOCATION_SZONE)
	e3:SetTargetRange(1,0)
	e3:SetCondition(c94000200.damcon)
	e3:SetOperation(c94000200.damop)
	c:RegisterEffect(e3)
	--indes 
	if not c94000200.global_check then 
	    c94000200.global_check=true 
		local ge1=Effect.CreateEffect(c)
		ge1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge1:SetCode(EVENT_ADJUST)
		ge1:SetOperation(c94000200.regop)
		Duel.RegisterEffect(ge1,0)
	end
end
function c94000200.damcon(e,tp,eg,ep,ev,re,r,rp)
    local at=Duel.GetAttacker()
	if at:GetBattleTarget()==nil then return false end
	if at:GetControler()~=tp then at=Duel.GetAttackTarget() end 
	return at and at:IsControler(tp) and (at:IsSetCard(0x24ba) or at:IsSetCard(0x9f)) and Duel.GetBattleDamage(e:GetHandlerPlayer(),REASON_BATTLE)~=0
end
function c94000200.damop(e,tp,eg,ep,ev,re,r,rp)
    Duel.ChangeBattleDamage(e:GetHandlerPlayer(),0)
end
function c94000200.indesfilter(c)
    return c:IsSetCard(0x9f) or c:IsSetCard(0x24ba)
end
function c94000200.regop(e,tp,eg,ep,ev,re,r,rp)
    local g=Duel.GetMatchingGroup(c94000200.indesfilter,0,LOCATION_MZONE,LOCATION_MZONE,nil)
	if g:GetCount()==0 then return false end 
	local tc=g:GetFirst()
	while tc do 
	    if tc:GetFlagEffect(94000200)==0 then 
	        local e1=Effect.CreateEffect(e:GetHandler())
		    e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
		    e1:SetType(EFFECT_TYPE_SINGLE)
		    e1:SetCode(EFFECT_INDESTRUCTABLE_COUNT)
			e1:SetRange(LOCATION_MZONE)
		    e1:SetCountLimit(1)
		    e1:SetValue(c94000200.indesval)
		    tc:RegisterEffect(e1)
			tc:RegisterFlagEffect(94000200,RESET_PHASE+PHASE_END+RESET_EVENT+0x1fe0000,0,1)
		end
		tc=g:GetNext()
	end
end
function c94000200.indestg(e,c)
    return (c:IsSetCard(0x9f) or c:IsSetCard(0x24ba)) and c:IsFaceup()
end
function c94000200.indesval(e,re,r,rp)
    return e:GetHandler():IsHasEffect(94000200) and bit.band(r,REASON_BATTLE+REASON_EFFECT)~=0 
end